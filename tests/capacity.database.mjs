import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { fixture } from '../../gallery-org/tests/helpers/booking-db.mjs';
const f=await fixture(), {db,rpc}=f;
const hash=v=>createHash('sha256').update(v).digest('hex');
let passed=0;
const test=async(name,run)=>{await run();passed++;console.log('PASS '+name);};
try {
 let sql=fs.readFileSync(new URL('../supabase/exhibition-capacity-200.review.sql',import.meta.url),'utf8');
 const offset=Date.parse('2026-10-31T15:00:00+03:00')-Date.now();
 sql=sql.replaceAll('now()',"(statement_timestamp()+interval '"+offset+" milliseconds')").replaceAll('clock_timestamp()',"(clock_timestamp()+interval '"+offset+" milliseconds')");
 await db.exec(sql);
 await test('40 hourly slots seeded once across the ten exhibition dates',async()=>{assert.equal((await db.query('select count(*) n from public.exhibition_booking_slots')).rows[0].n,40);await db.exec(sql);assert.equal((await db.query('select count(*) n from public.exhibition_booking_slots')).rows[0].n,40);});
 const slots=(await db.query('select * from public.exhibition_booking_slots order by visit_date,start_time')).rows;
 const day=slots.slice(0,4), next=slots.slice(4,8);
 const create=async(s,n,key=randomUUID())=>{const input={slot_id:s.id,visit_date: s.visit_date.toISOString().slice(0,10),full_name:'اختبار سعة معزول',phone:'+9647701234567',guest_count:n,notes:'',email:''}; return rpc('service_role','booking_create',[input,key,hash(JSON.stringify(input)),hash(key),hash(randomUUID())]);};
 const refs=[];
 await test('each hourly window admits 60 visitors and rejects the 61st',async()=>{refs.push((await create(day[0],60)).booking);assert.equal((await create(day[0],1)).code,'capacity');});
 await test('shared daily cap permits 60+60+60+20 and rejects 201st visitor',async()=>{refs.push((await create(day[1],60)).booking,(await create(day[2],60)).booking);assert.equal((await create(day[3],21)).code,'daily_capacity');refs.push((await create(day[3],20)).booking);assert.equal((await create(day[3],1)).code,'daily_capacity');});
 await test('availability hides a full day while preserving independent next-day capacity',async()=>{const available=await rpc('service_role','booking_slots');assert.equal(available.filter(s=>s.visit_date==='2026-10-31').length,0);assert.equal(available.filter(s=>s.visit_date==='2026-11-01').length,4);assert.ok(available.every(s=>s.remaining<=60));});
 await test('cancellation frees daily places and same-day reschedule does not double-count',async()=>{await rpc('admin','booking_manage',[refs[0].id,'cancel',null,'سبب اختبار معزول',randomUUID()]);await rpc('admin','booking_manage',[refs[1].id,'reschedule',day[0].id,'نقل ضمن اليوم للاختبار',randomUUID()]);const available=await rpc('service_role','booking_slots');const remaining=available.find(s=>s.id===day[3].id);assert.equal(remaining.remaining,40);});
 await test('cross-day reschedule cannot bypass the target daily cap',async()=>{for(let i=0;i<4;i++)await create(next[i],i<3?60:20);await assert.rejects(rpc('admin','booking_manage',[refs[3].id,'reschedule',next[3].id,'نقل عبر يومين للاختبار',randomUUID()]));});
 await test('admin cannot expand an hourly capacity above 60 or create an overlapping interval',async()=>{await assert.rejects(rpc('admin','booking_slot_save',[day[0].id,{capacity:61,is_closed:false},1]));await assert.rejects(rpc('admin','booking_slot_save',[null,{visit_date:'2026-11-02',start_time:'17:30',end_time:'18:30',capacity:60,is_closed:false},null]));});
 await test('Protocol still reads bookings through existing RPC; direct table privileges stay revoked',async()=>{const s=await rpc('protocol','booking_snapshot');assert.ok(s.stats.total>0);const r=await db.query("select has_table_privilege('authenticated','public.exhibition_bookings','select') allowed");assert.equal(r.rows[0].allowed,false);});
 console.log(passed+' isolated capacity checks passed; no production writes.');
} catch(error) { console.error(error.message, "position",error.position, "context",error.where); process.exitCode=1; } finally {await db.close();}
