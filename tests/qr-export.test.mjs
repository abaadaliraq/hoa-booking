import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import QRCode from 'qrcode';
const code=ts.transpileModule(fs.readFileSync(new URL('../lib/exhibition/qr-export.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const loaded={exports:{}};vm.runInNewContext('(function(module,exports){'+code+'})',{File,atob,Uint8Array})(loaded,loaded.exports);
const {qrPngFile,exportQr}=loaded.exports;
const qr=await QRCode.toDataURL('PREVIEW_ONLY_NOT_A_REAL_BOOKING',{margin:2,width:256});
test('downloaded PNG preserves the exact server image bytes and a safe filename',async()=>{
 const file=qrPngFile(qr,'EX-TEST');assert.equal(file.type,'image/png');assert.equal(file.name,'ABAAD-EX-TEST.png');assert.deepEqual(Buffer.from(await file.arrayBuffer()),Buffer.from(qr.split(',')[1],'base64'));
 assert.ok(!qrPngFile(qr,'../../EX/TEST').name.includes('/'));
});
test('invalid image formats cannot be exported as trusted PNG files',()=>{
 for(const value of ['https://evil.test/test.png','data:image/svg+xml;base64,PHN2Zz4=','data:image/png;base64,ZmFrZQ=='])assert.throws(()=>qrPngFile(value,'EX'));
});
test('supported file sharing receives the actual PNG directly in the click flow',async()=>{
 const file=qrPngFile(qr,'EX'),calls=[];const resultPromise=exportQr(file,{canShare:data=>{assert.equal(data.files[0],file);return true;},share:async data=>{calls.push(data.files[0]);},download:()=>assert.fail('No hidden download')});
 assert.equal(calls.length,1);assert.equal(await resultPromise,'shared');assert.equal(calls[0],file);
});
test('unsupported sharing requests a download without falsely reporting a saved gallery image',async()=>{
 let downloads=0;assert.equal(await exportQr(qrPngFile(qr,'EX'),{download:()=>downloads++}),'download-requested');assert.equal(downloads,1);
});
test('cancelled or blocked native sharing returns a manual fallback and never silently downloads',async()=>{
 for(const [name,expected]of [['AbortError','cancelled'],['NotAllowedError','share-unavailable']])assert.equal(await exportQr(qrPngFile(qr,'EX'),{canShare:()=>true,share:async()=>{throw {name};},download:()=>assert.fail('Fresh user click required')}),expected);
});
