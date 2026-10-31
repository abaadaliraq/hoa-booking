import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const loaded={exports:{}};const source=ts.transpileModule(fs.readFileSync(new URL('../lib/exhibition/domain.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext('(function(exports){'+source+'})',{})(loaded.exports);
const {normalizePhone,validateBooking}=loaded.exports;
test('booking accepts international numbers while retaining Iraqi local and Arabic-digit compatibility',()=>{
 for(const [input,expected]of [['+44 7700 900123','+447700900123'],['0044 7700 900123','+447700900123'],['+1 (202) 555-0123','+12025550123'],['+966501234567','+966501234567'],['+905321234567','+905321234567'],['+33612345678','+33612345678'],['+919876543210','+919876543210'],['٠٧٧٠١٢٣٤٥٦٧','+9647701234567'],['009647701234567','+9647701234567']]){
  assert.equal(normalizePhone(input),expected);assert.equal(validateBooking({full_name:'زائر اختبار',phone:input,email:'',notes:'',visit_date:'2026-10-31',slot_id:'10000000-0000-4000-8000-000000000001',guest_count:1}).phone,expected);
 }
});
test('bad numbers never reach the booking endpoint as supposedly normalized contacts',()=>{for(const input of ['+0123456789','+1234567890123456','+4412','+44abc123456','2025550123'])assert.equal(normalizePhone(input),null);});
