-- 创建用户表
create table users (
    id uuid primary key,
    email text not null unique,
    nickname text not null,
    avatar_url text,
    is_premium boolean default false,
    created_at bigint default extract(epoch from now()) * 1000,
    updated_at bigint default extract(epoch from now()) * 1000
);

-- 启用行级安全
alter table users enable row level security;

-- 创建策略：用户可以查看所有用户资料
create policy "Users can view all profiles" 
    on users for select 
    using (true);

-- 创建策略：用户只能更新自己的资料
create policy "Users can update own profile" 
    on users for update 
    using (auth.uid() = id);

-- 创建策略：用户只能插入自己的资料
create policy "Users can insert own profile" 
    on users for insert 
    with check (auth.uid() = id);

-- 授予权限
grant select on users to anon, authenticated;
grant insert on users to anon, authenticated;
grant update on users to authenticated;