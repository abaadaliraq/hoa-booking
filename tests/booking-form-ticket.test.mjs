import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const styles = new Proxy({}, { get: (_, name) => String(name) });
function load(file, deps = {}) {
 const result = { exports: {} };
 const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
 vm.runInNewContext('(function(require,module,exports){'+code+'})', {FormData, Intl, Date})(name => {
  if (name in deps) return deps[name];
  throw Error('Unexpected dependency '+name);
 }, result, result.exports);
 return result.exports;
}
const domain = load('../lib/exhibition/domain.ts');
const {bookingFormInput} = load('../lib/exhibition/form.ts', {'./domain':domain});
const schedule = load('../lib/exhibition/schedule.ts');
const {default:Ticket} = load('../components/booking/ExhibitionTicket.tsx', {
 'react/jsx-runtime': await import('react/jsx-runtime'),
 'next/image': {__esModule:true, default:(props)=>{const imageProps={...props};delete imageProps.unoptimized;return React.createElement('img',imageProps);}},
 '../../lib/exhibition/schedule':schedule,
 './booking.module.css': {__esModule:true,default:styles},
});
const slot='5fa5c3b3-b7ff-4c1b-83f4-6698a55f347a';
function form(values={}) {
 const data=new FormData();
 for(const [key,value] of Object.entries({full_name:'ضيف الاختبار',phone:'٠٧٧٠١٢٣٤٥٦٧',email:'',notes:'',slot_id:slot,...values}))data.set(key,value);
 return data;
}
test('submission reads the populated controls on the first attempt without needing an input event',()=>{
 const input=bookingFormInput(form(), '2026-10-31', '2');
 assert.equal(input.full_name,'ضيف الاختبار');
 assert.equal(input.phone,'+9647701234567');
 assert.equal(input.guest_count,2);
 assert.equal(input.slot_id,slot);
});
test('errors identify the actual missing field and valid fields need no retyping',()=>{
 const data=form({email:'wrong'});
 assert.throws(()=>bookingFormInput(data,'2026-10-31','2'),/البريد الإلكتروني/);
 data.set('email','');
 assert.equal(bookingFormInput(data,'2026-10-31','2').full_name,'ضيف الاختبار');
 assert.throws(()=>bookingFormInput(form({phone:''}),'2026-10-31','1'),/رقم الهاتف/);
 assert.throws(()=>bookingFormInput(form({full_name:''}),'2026-10-31','1'),/الاسم الكامل/);
 assert.throws(()=>bookingFormInput(form({slot_id:''}),'2026-10-31','1'),/وقت الزيارة/);
 assert.throws(()=>bookingFormInput(form(),'2026-10-31','61'));
});
const fixture={booking:{id:'preview-only',booking_reference:'PREVIEW-ONLY',full_name:'ضيف بيت التحفيات',visit_date:'2026-10-31',start_time:'17:00:00',end_time:'18:00:00',guest_count:2,status:'confirmed'},qr:'data:image/png;base64,fixture',notification_status:'sent'};
test('ticket preserves authoritative booking facts and exact QR source without invented prices',()=>{
 const html=renderToStaticMarkup(React.createElement(Ticket,{ticket:fixture}));
 assert.ok(html.includes('ضيف بيت التحفيات'));
 assert.ok(html.includes('PREVIEW-ONLY'));
 assert.ok(html.includes('5 – 6 مساءً'));
 assert.ok(html.includes('src="data:image/png;base64,fixture"'));
 assert.ok(html.indexOf('<img') < html.indexOf('ضيف بيت التحفيات'));
 assert.ok(!html.includes('دولار'));
 const cancelled=renderToStaticMarkup(React.createElement(Ticket,{ticket:{...fixture,booking:{...fixture.booking,status:'cancelled'}}}));
 assert.ok(cancelled.includes('الحجز ملغى'));
 assert.ok(!cancelled.includes('<img'));
 const missing=renderToStaticMarkup(React.createElement(Ticket,{ticket:{...fixture,qr:null}}));
 assert.ok(missing.includes('تعذر عرض الرمز'));
});
if(process.argv.includes('--preview')) {
 const {default:QRCode}=await import('qrcode');
 fixture.qr=await QRCode.toDataURL('PREVIEW_ONLY_NOT_A_VALID_BOOKING',{margin:4,width:256});
 const markup=renderToStaticMarkup(React.createElement(Ticket,{ticket:fixture}));
 const css=fs.readFileSync(new URL('../components/booking/booking.module.css',import.meta.url),'utf8');
 const {createServer}=await import('node:http');
 createServer((req,res)=>{
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(req.url==='/'?`<!doctype html><html><body style="margin:0;background:#e9e3da"><h3>LOCAL PREVIEW — synthetic ticket only</h3><div style="display:flex;gap:24px;align-items:flex-start"><iframe title="Mobile" src="/ticket" style="width:390px;height:1000px;border:0"></iframe><iframe title="Desktop" src="/ticket" style="width:900px;height:800px;border:0"></iframe></div></body></html>`:`<!doctype html><html lang="ar" dir="rtl"><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#fffdf8}${css}</style><div class="ticketSection exhibitionSection">${markup}</div></html>`);
 }).listen(3041,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:3041'));
}
if(process.argv.includes('--app-preview')) {
 const {default:QRCode}=await import('qrcode');
 const qr=await QRCode.toDataURL('PREVIEW_ONLY_NOT_A_VALID_BOOKING',{margin:4,width:256});
 const {createServer,request}=await import('node:http');
 let posts=0;
 createServer(async(req,res)=>{
  if(req.url==='/api/exhibition/slots') {
   res.setHeader('Content-Type','application/json');
   res.end(JSON.stringify({slots:['2026-10-31','2026-11-01'].map(visit_date=>({id:slot,visit_date,start_time:'17:00:00',end_time:'18:00:00',remaining:60}))}));return;
  }
  if(req.url==='/api/exhibition/bookings' && req.method==='POST') {
   let raw='';for await(const chunk of req)raw+=chunk;
   const input=domain.validateBooking(JSON.parse(raw));posts++;
   console.log('LOCAL FIXTURE booking submissions: '+posts);
   res.setHeader('Content-Type','application/json');
   res.end(JSON.stringify({...fixture,qr,booking:{...fixture.booking,...input}}));return;
  }
  const upstream=request({hostname:'127.0.0.1',port:3042,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:3042'}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});
  upstream.on('error',()=>{res.writeHead(502);res.end('Local dev server unavailable');});
  req.pipe(upstream);
 }).listen(3043,'127.0.0.1',()=>console.log('Isolated real-app UI: http://127.0.0.1:3043; booking endpoints are synthetic, never forwarded.'));
}
