import fs from 'node:fs';
const source=fs.readFileSync('C:/HOA-SYSTEM/gallery-org/supabase/exhibition-bookings.sql','utf8').replaceAll('\r\n','\n');
function body(name) {
 const start=source.indexOf('create function abaad_private.'+name+'(');
 const end=source.indexOf('end $$;',start)+7;
 if(start<0||end<7)throw Error('missing '+name);
 return source.slice(start,end).replace('create function','create or replace function');
}
let create=body('booking_create').replace('n>200','n>60');
create=create.replace("  if s.reserved_count+n>s.capacity then",`  if s.start_time not in (time '17:00',time '18:00',time '19:00',time '20:00') or s.end_time<>s.start_time+interval '1 hour' then return jsonb_build_object('ok',false,'code','closed'); end if;
  if (select coalesce(sum(reserved_count),0) from public.exhibition_booking_slots where exhibition_id=s.exhibition_id and visit_date=s.visit_date)+n>200 then return jsonb_build_object('ok',false,'code','daily_capacity'); end if;
  if s.reserved_count+n>least(s.capacity,60) then`);
let manage=body('booking_manage').replace('target.reserved_count+b.guest_count>target.capacity','target.reserved_count+b.guest_count>least(target.capacity,60)');
manage=manage.replace('  update public.exhibition_booking_slots set reserved_count=reserved_count+b.guest_count',`  if target.start_time not in (time '17:00',time '18:00',time '19:00',time '20:00') or target.end_time<>target.start_time+interval '1 hour' then raise exception 'target_unavailable'; end if;
  if (select coalesce(sum(reserved_count),0) from public.exhibition_booking_slots where exhibition_id=b.exhibition_id and visit_date=target.visit_date)+b.guest_count-(case when target.visit_date=b.visit_date then b.guest_count else 0 end)>200 then raise exception 'daily_capacity'; end if;
  update public.exhibition_booking_slots set reserved_count=reserved_count+b.guest_count`);
let save=body('booking_slot_save').replace(" if p_id is null then",` if p_id is null and ((p_data->>'start_time')::time not in (time '17:00',time '18:00',time '19:00',time '20:00') or (p_data->>'end_time')::time<>(p_data->>'start_time')::time+interval '1 hour') then raise exception 'invalid_exhibition_hours'; end if;
 if (p_data->>'capacity')::integer>60 then raise exception 'hourly_capacity_exceeded'; end if;
 if p_id is null then`);
const slots=`create or replace function abaad_private.booking_slots() returns jsonb language sql stable security definer set search_path='' as $$
 with days as (select exhibition_id,visit_date,coalesce(sum(reserved_count),0) used from public.exhibition_booking_slots group by exhibition_id,visit_date), available as (
 select s.id,s.visit_date,s.start_time,s.end_time,least(s.capacity-s.reserved_count,60-s.reserved_count,200-d.used)::integer remaining
 from public.exhibition_booking_slots s join public.protocol_exhibitions e on e.id=s.exhibition_id join days d on d.exhibition_id=s.exhibition_id and d.visit_date=s.visit_date
 where e.slug='naima-baghdad-2026' and e.is_active and not s.is_closed and s.capacity>s.reserved_count
 and s.start_time in (time '17:00',time '18:00',time '19:00',time '20:00') and s.end_time=s.start_time+interval '1 hour'
 and (s.visit_date+s.end_time) at time zone 'Asia/Baghdad'>now())
 select coalesce(jsonb_agg(to_jsonb(a) order by visit_date,start_time),'[]') from available a where remaining>0;
$$;`;
const seed=`-- Idempotent inventory only: no guest, reservation, arrival, staff or Auth rows.
do $$ declare ex uuid; begin
 select id into strict ex from public.protocol_exhibitions where slug='naima-baghdad-2026' and is_active;
 if exists(select 1 from public.exhibition_booking_slots where exhibition_id=ex and (start_time not in (time '17:00',time '18:00',time '19:00',time '20:00') or end_time<>start_time+interval '1 hour' or capacity>60)) then raise exception 'review_existing_slots_before_activation'; end if;
 if exists(select 1 from public.exhibition_booking_slots where exhibition_id=ex group by visit_date having sum(reserved_count)>200) then raise exception 'review_existing_daily_counts'; end if;
 insert into public.exhibition_booking_slots(exhibition_id,visit_date,start_time,end_time,capacity,is_closed)
 select ex,d::date,h::time,(h+interval '1 hour')::time,60,false
 from generate_series(date '2026-10-31',date '2026-11-09',interval '1 day') d
 cross join (values(time '17:00'),(time '18:00'),(time '19:00'),(time '20:00')) hours(h)
 on conflict(exhibition_id,visit_date,start_time) do nothing;
end $$;`;
fs.writeFileSync('supabase/exhibition-capacity-200.review.sql',`-- REVIEW: target pwlwelxnrrignapdsyiw only. 60/hour, shared 200/day, 17:00–21:00 Baghdad.
-- Reuses existing RPCs, authorization and serialization lock. No RLS/grant/Auth changes.
begin;
set local lock_timeout='10s';
set local statement_timeout='30s';
select pg_advisory_xact_lock(hashtext('abaad-exhibition-bookings-2026'));
${slots}\n${create}\n${manage}\n${save}\n${seed}\ncommit;\n`);
