-- REVIEW: target pwlwelxnrrignapdsyiw only. 60/hour, shared 200/day, 17:00–21:00 Baghdad.
-- Reuses existing RPCs, authorization and serialization lock. No RLS/grant/Auth changes.
begin;
set local lock_timeout='10s';
set local statement_timeout='30s';
select pg_advisory_xact_lock(hashtext('abaad-exhibition-bookings-2026'));
create or replace function abaad_private.booking_slots() returns jsonb language sql stable security definer set search_path='' as $$
 with days as (select exhibition_id,visit_date,coalesce(sum(reserved_count),0) used from public.exhibition_booking_slots group by exhibition_id,visit_date), available as (
 select s.id,s.visit_date,s.start_time,s.end_time,least(s.capacity-s.reserved_count,60-s.reserved_count,200-d.used)::integer remaining
 from public.exhibition_booking_slots s join public.protocol_exhibitions e on e.id=s.exhibition_id join days d on d.exhibition_id=s.exhibition_id and d.visit_date=s.visit_date
 where e.slug='naima-baghdad-2026' and e.is_active and not s.is_closed and s.capacity>s.reserved_count
 and s.start_time in (time '17:00',time '18:00',time '19:00',time '20:00') and s.end_time=s.start_time+interval '1 hour'
 and (s.visit_date+s.end_time) at time zone 'Asia/Baghdad'>now())
 select coalesce(jsonb_agg(to_jsonb(a) order by visit_date,start_time),'[]') from available a where remaining>0;
$$;
create or replace function abaad_private.booking_create(p_data jsonb,p_request_key uuid,p_request_hash text,p_token_hash text,p_ip_hash text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare b public.exhibition_bookings; s public.exhibition_booking_slots; n integer; ip_count integer;
begin
 -- A single bounded exhibition queue serializes capacity, cancellation and rescheduling.
 -- Slot row locks additionally document the capacity invariant. No application-side count-then-insert.
 perform pg_advisory_xact_lock(hashtext('abaad-exhibition-bookings-2026'));
 if p_request_key is null or p_request_hash is null or p_token_hash is null or p_ip_hash is null or p_request_hash !~ '^[a-f0-9]{64}$' or p_token_hash !~ '^[a-f0-9]{64}$' or p_ip_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_request'; end if;
 select * into b from public.exhibition_bookings where request_key=p_request_key;
 if found then
  if b.request_hash<>p_request_hash or b.token_hash<>p_token_hash then raise exception 'idempotency_conflict'; end if;
 else
  insert into abaad_private.booking_rate_buckets(ip_hash,bucket) values(p_ip_hash,date_trunc('hour',now()))
   on conflict(ip_hash,bucket) do update set attempts=abaad_private.booking_rate_buckets.attempts+1 returning attempts into ip_count;
  delete from abaad_private.booking_rate_buckets where bucket<now()-interval '2 hours';
  -- Return, rather than raise: rejected attempts must not roll back the limiter.
  if ip_count>10 then return jsonb_build_object('ok',false,'code','rate_limit'); end if;
  n:=(p_data->>'guest_count')::integer;
  if n is null or n<1 or n>60 or char_length(trim(p_data->>'full_name')) not between 2 and 160
    or coalesce(p_data->>'phone','') !~ '^\+9647[0-9]{9}$'
    or char_length(coalesce(p_data->>'notes',''))>500
    or char_length(coalesce(p_data->>'email',''))>254 then raise exception 'invalid_data'; end if;
  select sl.* into s from public.exhibition_booking_slots sl join public.protocol_exhibitions e on e.id=sl.exhibition_id
    where sl.id=(p_data->>'slot_id')::uuid and e.slug='naima-baghdad-2026' and e.is_active for update of sl;
  if not found or s.is_closed or s.capacity is null or s.visit_date<> (p_data->>'visit_date')::date
    or (s.visit_date+s.end_time) at time zone 'Asia/Baghdad'<=now() then return jsonb_build_object('ok',false,'code','closed'); end if;
  if s.start_time not in (time '17:00',time '18:00',time '19:00',time '20:00') or s.end_time<>s.start_time+interval '1 hour' then return jsonb_build_object('ok',false,'code','closed'); end if;
  if (select coalesce(sum(reserved_count),0) from public.exhibition_booking_slots where exhibition_id=s.exhibition_id and visit_date=s.visit_date)+n>200 then return jsonb_build_object('ok',false,'code','daily_capacity'); end if;
  if s.reserved_count+n>least(s.capacity,60) then return jsonb_build_object('ok',false,'code','capacity'); end if;
  insert into public.exhibition_bookings(exhibition_id,slot_id,visit_date,full_name,phone,email,notes,guest_count,request_key,request_hash,token_hash)
   values(s.exhibition_id,s.id,s.visit_date,trim(p_data->>'full_name'),p_data->>'phone',nullif(p_data->>'email',''),coalesce(p_data->>'notes',''),n,p_request_key,p_request_hash,p_token_hash) returning * into b;
  update public.exhibition_booking_slots set reserved_count=reserved_count+n,version=version+1,updated_at=clock_timestamp() where id=s.id;
  insert into public.exhibition_booking_notifications(booking_id) values(b.id);
 end if;
 select * into s from public.exhibition_booking_slots where id=b.slot_id;
 return jsonb_build_object('ok',true,'booking',jsonb_build_object('id',b.id,'booking_reference',b.booking_reference,'full_name',b.full_name,
  'visit_date',b.visit_date,'start_time',s.start_time,'end_time',s.end_time,'guest_count',b.guest_count,'status',b.status,'price_usd',0,'created_at',b.created_at),
  'notification_status',(select status from public.exhibition_booking_notifications where booking_id=b.id));
end $$;
create or replace function abaad_private.booking_manage(p_id uuid,p_action text,p_slot uuid,p_reason text,p_operation uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare b public.exhibition_bookings; target public.exhibition_booking_slots; ev public.exhibition_booking_checkin_events;
begin
 perform pg_advisory_xact_lock(hashtext('abaad-exhibition-bookings-2026'));
 if abaad_private.protocol_actor_role() is distinct from 'admin' then raise exception 'forbidden' using errcode='42501'; end if;
 select * into b from public.exhibition_bookings where id=p_id for update;
 if not found or not coalesce(abaad_private.protocol_allowed(b.exhibition_id),false) then raise exception 'forbidden' using errcode='42501'; end if;
 if p_operation is null or p_action is null or char_length(trim(coalesce(p_reason,''))) not between 5 and 500 or p_action not in ('cancel','reschedule') then raise exception 'invalid_action'; end if;
 select * into ev from public.exhibition_booking_checkin_events where operation_id=p_operation;
 if found then
  if ev.booking_id<>p_id or ev.action<>p_action or ev.actor_id<>auth.uid() or (p_action='reschedule' and ev.details->>'slot_id' is distinct from p_slot::text) then raise exception 'operation_conflict'; end if;
  return jsonb_build_object('ok',true,'replayed',true);
 end if;
 if b.status<>'confirmed' or b.checked_in_guest_count<>0 then raise exception 'booking_has_arrivals_or_cancelled'; end if;
 if p_action='reschedule' then
  select * into target from public.exhibition_booking_slots where id=p_slot and exhibition_id=b.exhibition_id for update;
  if not found or target.id=b.slot_id or target.is_closed or target.capacity is null or target.reserved_count+b.guest_count>least(target.capacity,60)
   or (target.visit_date+target.end_time) at time zone 'Asia/Baghdad'<=now() then raise exception 'target_unavailable'; end if;
  if target.start_time not in (time '17:00',time '18:00',time '19:00',time '20:00') or target.end_time<>target.start_time+interval '1 hour' then raise exception 'target_unavailable'; end if;
  if (select coalesce(sum(reserved_count),0) from public.exhibition_booking_slots where exhibition_id=b.exhibition_id and visit_date=target.visit_date)+b.guest_count-(case when target.visit_date=b.visit_date then b.guest_count else 0 end)>200 then raise exception 'daily_capacity'; end if;
  update public.exhibition_booking_slots set reserved_count=reserved_count+b.guest_count,version=version+1,updated_at=clock_timestamp() where id=target.id;
 end if;
 update public.exhibition_booking_slots set reserved_count=reserved_count-b.guest_count,version=version+1,updated_at=clock_timestamp() where id=b.slot_id;
 update public.exhibition_bookings set status=case when p_action='cancel' then 'cancelled' else status end,cancelled_at=case when p_action='cancel' then clock_timestamp() else null end,
  slot_id=case when p_action='reschedule' then target.id else slot_id end,visit_date=case when p_action='reschedule' then target.visit_date else visit_date end,updated_at=clock_timestamp() where id=b.id;
 insert into public.exhibition_booking_checkin_events(booking_id,actor_id,operation_id,action,guest_delta,reason,details)
  values(b.id,auth.uid(),p_operation,p_action,0,p_reason,jsonb_build_object('previous_slot_id',b.slot_id,'slot_id',p_slot));
 return jsonb_build_object('ok',true);
end $$;
create or replace function abaad_private.booking_slot_save(p_id uuid,p_data jsonb,p_version integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.exhibition_booking_slots; e uuid;
begin
 perform pg_advisory_xact_lock(hashtext('abaad-exhibition-bookings-2026'));
 if abaad_private.protocol_actor_role() is distinct from 'admin' then raise exception 'forbidden' using errcode='42501'; end if;
 select id into e from public.protocol_exhibitions where slug='naima-baghdad-2026' and is_active;
 if e is null then raise exception 'exhibition_unavailable'; end if;
 if p_id is null and ((p_data->>'start_time')::time not in (time '17:00',time '18:00',time '19:00',time '20:00') or (p_data->>'end_time')::time<>(p_data->>'start_time')::time+interval '1 hour') then raise exception 'invalid_exhibition_hours'; end if;
 if (p_data->>'capacity')::integer>60 then raise exception 'hourly_capacity_exceeded'; end if;
 if p_id is null then
  insert into public.exhibition_booking_slots(exhibition_id,visit_date,start_time,end_time,capacity,is_closed)
   values(e,(p_data->>'visit_date')::date,(p_data->>'start_time')::time,(p_data->>'end_time')::time,(p_data->>'capacity')::integer,coalesce((p_data->>'is_closed')::boolean,true)) returning * into s;
 else
  select * into s from public.exhibition_booking_slots where id=p_id and exhibition_id=e for update;
  if not found or s.version is distinct from p_version then raise exception 'stale_slot'; end if;
  -- Date/time identity is immutable; create a new slot and explicitly reschedule bookings instead.
  update public.exhibition_booking_slots set capacity=(p_data->>'capacity')::integer,is_closed=(p_data->>'is_closed')::boolean,version=version+1,updated_at=clock_timestamp() where id=p_id returning * into s;
 end if;
 return jsonb_build_object('ok',true,'id',s.id);
end $$;
-- Idempotent inventory only: no guest, reservation, arrival, staff or Auth rows.
do $$ declare ex uuid; begin
 select id into strict ex from public.protocol_exhibitions where slug='naima-baghdad-2026' and is_active;
 if exists(select 1 from public.exhibition_booking_slots where exhibition_id=ex and (start_time not in (time '17:00',time '18:00',time '19:00',time '20:00') or end_time<>start_time+interval '1 hour' or capacity>60)) then raise exception 'review_existing_slots_before_activation'; end if;
 if exists(select 1 from public.exhibition_booking_slots where exhibition_id=ex group by visit_date having sum(reserved_count)>200) then raise exception 'review_existing_daily_counts'; end if;
 insert into public.exhibition_booking_slots(exhibition_id,visit_date,start_time,end_time,capacity,is_closed)
 select ex,d::date,h::time,(h+interval '1 hour')::time,60,false
 from generate_series(date '2026-10-31',date '2026-11-09',interval '1 day') d
 cross join (values(time '17:00'),(time '18:00'),(time '19:00'),(time '20:00')) hours(h)
 on conflict(exhibition_id,visit_date,start_time) do nothing;
end $$;
commit;
