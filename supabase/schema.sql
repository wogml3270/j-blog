create extension if not exists pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publish_status') THEN
    CREATE TYPE public.publish_status AS ENUM ('draft', 'published');
  END IF;
END
$$;

create table if not exists public.admin_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_super_admin boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  body_markdown text not null,
  reading_time text not null default '1분',
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_tag_map (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.post_tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, tag_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  thumbnail text not null,
  role text not null,
  period text not null,
  tech_stack jsonb not null default '[]'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  contributions jsonb not null default '[]'::jsonb,
  links jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profile_content (
  id integer primary key,
  name text not null,
  title text not null,
  summary text not null,
  about_experience text not null,
  strengths jsonb not null default '[]'::jsonb,
  work_style text not null,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profile_content_singleton check (id = 1)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_email text not null,
  author_nickname text not null,
  author_avatar_url text,
  content text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null check (status in ('new', 'read', 'replied')) default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists profile_content_set_updated_at on public.profile_content;
create trigger profile_content_set_updated_at
before update on public.profile_content
for each row
execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row
execute function public.set_updated_at();

create or replace function public.is_verified_email()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'email_verified')::boolean, false)
$$;

create or replace function public.is_admin_email()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_verified_email()
    and exists (
      select 1
      from public.admin_allowlist a
      where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
$$;

grant usage on schema public to anon, authenticated;
grant select on public.posts, public.post_tags, public.post_tag_map, public.projects, public.profile_content to anon, authenticated;
grant insert on public.comments, public.contact_messages to anon, authenticated;
grant execute on function public.is_admin_email() to anon, authenticated;
grant execute on function public.is_verified_email() to anon, authenticated;

alter table public.admin_allowlist enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.post_tag_map enable row level security;
alter table public.projects enable row level security;
alter table public.profile_content enable row level security;
alter table public.comments enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists admin_allowlist_self_read on public.admin_allowlist;
create policy admin_allowlist_self_read
on public.admin_allowlist
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists admin_allowlist_admin_manage on public.admin_allowlist;
create policy admin_allowlist_admin_manage
on public.admin_allowlist
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists posts_public_read on public.posts;
create policy posts_public_read
on public.posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists posts_admin_manage on public.posts;
create policy posts_admin_manage
on public.posts
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists post_tags_public_read on public.post_tags;
create policy post_tags_public_read
on public.post_tags
for select
to anon, authenticated
using (true);

drop policy if exists post_tags_admin_manage on public.post_tags;
create policy post_tags_admin_manage
on public.post_tags
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists post_tag_map_public_read on public.post_tag_map;
create policy post_tag_map_public_read
on public.post_tag_map
for select
to anon, authenticated
using (true);

drop policy if exists post_tag_map_admin_manage on public.post_tag_map;
create policy post_tag_map_admin_manage
on public.post_tag_map
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read
on public.projects
for select
to anon, authenticated
using (status = 'published');

drop policy if exists projects_admin_manage on public.projects;
create policy projects_admin_manage
on public.projects
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists profile_public_read on public.profile_content;
create policy profile_public_read
on public.profile_content
for select
to anon, authenticated
using (status = 'published');

drop policy if exists profile_admin_manage on public.profile_content;
create policy profile_admin_manage
on public.profile_content
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists comments_public_read on public.comments;
create policy comments_public_read
on public.comments
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists comments_user_insert on public.comments;
create policy comments_user_insert
on public.comments
for insert
to authenticated
with check (auth.uid() = author_user_id);

drop policy if exists comments_admin_manage on public.comments;
drop policy if exists comments_admin_update on public.comments;
create policy comments_admin_update
on public.comments
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete
on public.comments
for delete
to authenticated
using (public.is_admin_email());

drop policy if exists contact_public_insert on public.contact_messages;
create policy contact_public_insert
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists contact_admin_read on public.contact_messages;
create policy contact_admin_read
on public.contact_messages
for select
to authenticated
using (public.is_admin_email());

drop policy if exists contact_admin_update on public.contact_messages;
create policy contact_admin_update
on public.contact_messages
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

insert into public.admin_allowlist (email, is_super_admin)
values ('wogml3270@gmail.com', true)
on conflict (email) do update set is_super_admin = excluded.is_super_admin;

insert into public.admin_allowlist (email, is_super_admin)
values ('wogml3270@naver.com', true)
on conflict (email) do update set is_super_admin = excluded.is_super_admin;

alter table public.comments add column if not exists author_email text;
alter table public.comments add column if not exists author_nickname text;
alter table public.comments add column if not exists author_avatar_url text;

update public.comments
set
  author_email = coalesce(nullif(author_email, ''), 'unknown@example.com'),
  author_nickname = coalesce(nullif(author_nickname, ''), '익명 사용자')
where author_email is null or author_email = '' or author_nickname is null or author_nickname = '';

alter table public.comments alter column author_email set not null;
alter table public.comments alter column author_nickname set not null;
