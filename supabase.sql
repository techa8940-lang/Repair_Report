-- 1. ตารางข้อมูลโปรไฟล์ผู้ใช้งาน (Profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text default 'reporter' check (role in ('reporter', 'tech', 'admin')),
  tel text,
  org text,
  created_at timestamptz default now()
);

-- Trigger สร้างข้อมูลลง profiles อัตโนมัติเมื่อมีการ Register ผ่าน auth.users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, name, role, tel, org)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'reporter'),
    new.raw_user_meta_data->>'tel',
    new.raw_user_meta_data->>'org'
  )
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role,
    tel = excluded.tel,
    org = excluded.org;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- เปิด RLS สำหรับ profiles
alter table public.profiles enable row level security;
drop policy if exists "Allow read profiles" on public.profiles;
create policy "Allow read profiles" on public.profiles for select using (true);
drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update profiles" on public.profiles for update using (true);
drop policy if exists "Allow insert own profile" on public.profiles;
create policy "Allow insert own profile" on public.profiles for insert with check (true);
drop policy if exists "Allow delete profiles" on public.profiles;
create policy "Allow delete profiles" on public.profiles for delete using (true);

-- 2. ฟังก์ชันค้นหาใบงาน (track_ticket)
create or replace function track_ticket(p_id text, p_email text default null)
returns setof tickets language plpgsql security definer as $$
begin
  if p_email is not null and trim(p_email) <> '' then
    return query 
    select * from tickets 
    where upper(trim(id)) = upper(trim(p_id)) 
      and lower(email) = lower(trim(p_email));
  else
    return query 
    select * from tickets 
    where upper(trim(id)) = upper(trim(p_id));
  end if;
end;
$$;

grant execute on function track_ticket to anon, authenticated;

-- 3. ฟังก์ชันสำหรับให้ผู้แจ้งยกเลิกใบงานของตัวเอง (cancel_my_ticket)
create or replace function cancel_my_ticket(p_id text, p_email text) 
returns void language plpgsql security definer set search_path=public as $$
begin
  update tickets 
  set status = 'deleted', 
      deleted_at = now(), 
      deleted_by = 'ผู้แจ้ง (ยกเลิกเอง)', 
      history = history || jsonb_build_object('s', 'deleted', 'at', extract(epoch from now()) * 1000)
  where upper(trim(id)) = upper(trim(p_id)) 
    and lower(email) = lower(trim(p_email)) 
    and status = 'accepted' 
    and tech_id is null;
end $$;

grant execute on function cancel_my_ticket to anon, authenticated;

-- 4. ฟังก์ชันสำหรับแอดมินตั้ง/รีเซ็ตรหัสผ่านใหม่ให้ผู้ใช้โดยตรง (admin_reset_password)
create extension if not exists "pgcrypto";

-- ลบเวอร์ชันเดิมออกเพื่อป้องกันปัญหา Signature ทับซ้อน
drop function if exists public.admin_reset_password(uuid, text);
drop function if exists public.admin_reset_password(text, text);
drop function if exists public.admin_reset_password(text, text, text);

create or replace function public.admin_reset_password(
  target_user_id text, 
  new_password text,
  target_email text default null
)
returns jsonb 
language plpgsql 
security definer 
set search_path = public, auth, extensions 
as $$
declare
  v_user_id uuid;
  v_email text := trim(lower(coalesce(target_email, '')));
  v_encrypted_pw text;
begin
  if new_password is null or length(trim(new_password)) < 6 then
    return jsonb_build_object('success', false, 'message', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  end if;

  -- 1. เข้ารหัสผ่านใหม่ด้วยมาตรฐาน bcrypt cost 10 ที่ Supabase GoTrue รองรับ 100%
  v_encrypted_pw := extensions.crypt(new_password, extensions.gen_salt('bf', 10));

  -- 2. ค้นหา User ID
  -- 2.1 ตรวจสอบว่า target_user_id เป็น UUID หรือไม่
  begin
    if target_user_id is not null and target_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_user_id := target_user_id::uuid;
    end if;
  exception when others then
    v_user_id := null;
  end;

  -- 2.2 ค้นหาใน auth.users ด้วย id หรือ email
  if v_user_id is not null then
    perform 1 from auth.users where id = v_user_id;
    if not found and v_email <> '' then
      select id into v_user_id from auth.users where lower(email) = v_email limit 1;
    end if;
  elsif v_email <> '' then
    select id into v_user_id from auth.users where lower(email) = v_email limit 1;
  end if;

  -- 3. หากพบบัญชีใน auth.users ให้อัปเดตรหัสผ่านและยืนยันอีเมลทันที
  if v_user_id is not null then
    update auth.users
    set encrypted_password = v_encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = v_user_id;

    return jsonb_build_object(
      'success', true, 
      'message', 'เปลี่ยนรหัสผ่านใน auth.users สำเร็จเรียบร้อย',
      'user_id', v_user_id
    );
  end if;

  -- 4. หากยังไม่มีบัญชีใน auth.users (เช่น ถูกสร้างเฉพาะใน profiles) ให้สร้างบัญชี Login ใหม่ทันที
  if v_email <> '' then
    if v_user_id is null then
      v_user_id := extensions.gen_random_uuid();
    end if;

    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      v_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- ซิงค์ id ใน profiles ให้ตรงกัน
    if target_user_id is not null and target_user_id <> v_user_id::text then
      update public.profiles
      set id = v_user_id
      where id::text = target_user_id or lower(coalesce(email, '')) = v_email;
    end if;

    return jsonb_build_object(
      'success', true, 
      'message', 'สร้างและกำหนดรหัสผ่านใน auth.users สำเร็จเรียบร้อย',
      'user_id', v_user_id
    );
  end if;

  return jsonb_build_object(
    'success', false, 
    'message', 'ไม่พบบัญชีผู้ใช้ในระบบ และไม่มีข้อมูลอีเมลสำหรับสร้างหรือเปลี่ยนรหัสผ่าน'
  );
end;
$$;

grant execute on function public.admin_reset_password(text, text, text) to anon, authenticated, service_role;

