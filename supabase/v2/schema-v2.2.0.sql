-- Schema Version: v2.2.0
-- Created At: 2026-04-20
-- Purpose:
--   - comments -> posts_comments rename
--   - projects_comments table add
--   - projects achievements/contributions remove
--   - projects.links normalize to array with isPublic

begin;

-- ---------------------------------------------------------
-- comments -> posts_comments
-- ---------------------------------------------------------
do $$
begin
  if to_regclass('public.comments') is not null and to_regclass('public.posts_comments') is null then
    alter table public.comments rename to posts_comments;
  end if;
end $$;

-- ---------------------------------------------------------
-- projects_comments (project detail comments)
-- ---------------------------------------------------------
create table if not exists public.projects_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_email text not null,
  author_nickname text not null,
  author_avatar_url text,
  content text not null,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_comments_project_id_created_at
  on public.projects_comments (project_id, created_at);

create index if not exists idx_projects_comments_author_user_id
  on public.projects_comments (author_user_id);

alter table if exists public.posts_comments enable row level security;
alter table if exists public.projects_comments enable row level security;

grant insert on public.posts_comments, public.projects_comments to anon, authenticated;
grant select, insert, update, delete on public.posts_comments, public.projects_comments to authenticated;
grant select, insert, update, delete on public.posts_comments, public.projects_comments to service_role;

drop policy if exists posts_comments_public_read on public.posts_comments;
create policy posts_comments_public_read
on public.posts_comments
for select
using (status = 'approved');

drop policy if exists posts_comments_user_insert on public.posts_comments;
create policy posts_comments_user_insert
on public.posts_comments
for insert
to authenticated
with check (auth.uid() = author_user_id and status = 'approved');

drop policy if exists posts_comments_user_update on public.posts_comments;
create policy posts_comments_user_update
on public.posts_comments
for update
to authenticated
using (auth.uid() = author_user_id)
with check (auth.uid() = author_user_id);

drop policy if exists posts_comments_user_delete on public.posts_comments;
create policy posts_comments_user_delete
on public.posts_comments
for delete
to authenticated
using (auth.uid() = author_user_id);

drop policy if exists posts_comments_admin_update on public.posts_comments;
create policy posts_comments_admin_update
on public.posts_comments
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists posts_comments_admin_delete on public.posts_comments;
create policy posts_comments_admin_delete
on public.posts_comments
for delete
to authenticated
using (public.is_admin_email());

drop policy if exists projects_comments_public_read on public.projects_comments;
create policy projects_comments_public_read
on public.projects_comments
for select
using (status = 'approved');

drop policy if exists projects_comments_user_insert on public.projects_comments;
create policy projects_comments_user_insert
on public.projects_comments
for insert
to authenticated
with check (auth.uid() = author_user_id and status = 'approved');

drop policy if exists projects_comments_user_update on public.projects_comments;
create policy projects_comments_user_update
on public.projects_comments
for update
to authenticated
using (auth.uid() = author_user_id)
with check (auth.uid() = author_user_id);

drop policy if exists projects_comments_user_delete on public.projects_comments;
create policy projects_comments_user_delete
on public.projects_comments
for delete
to authenticated
using (auth.uid() = author_user_id);

drop policy if exists projects_comments_admin_update on public.projects_comments;
create policy projects_comments_admin_update
on public.projects_comments
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists projects_comments_admin_delete on public.projects_comments;
create policy projects_comments_admin_delete
on public.projects_comments
for delete
to authenticated
using (public.is_admin_email());

-- ---------------------------------------------------------
-- projects: remove achievements/contributions
-- ---------------------------------------------------------
alter table if exists public.projects drop column if exists achievements;
alter table if exists public.projects drop column if exists contributions;
alter table if exists public.projects_en drop column if exists achievements;
alter table if exists public.projects_en drop column if exists contributions;
alter table if exists public.projects_ja drop column if exists achievements;
alter table if exists public.projects_ja drop column if exists contributions;

-- ---------------------------------------------------------
-- projects.links normalize (array + isPublic)
-- ---------------------------------------------------------
alter table if exists public.projects
  alter column links set default '[]'::jsonb;

update public.projects
set links = coalesce(
  (
    select jsonb_agg(
      case
        when jsonb_typeof(link_item) = 'object' then
          jsonb_build_object(
            'label', coalesce(link_item->>'label', ''),
            'url', coalesce(link_item->>'url', ''),
            'isPublic',
              case
                when lower(coalesce(link_item->>'isPublic', '')) in ('true', 'false') then
                  (link_item->>'isPublic')::boolean
                else true
              end
          )
        else null
      end
    )
    from jsonb_array_elements(
      case
        when jsonb_typeof(links) = 'array' then links
        else '[]'::jsonb
      end
    ) as t(link_item)
  ),
  '[]'::jsonb
)
where jsonb_typeof(links) = 'array';

update public.projects
set links = coalesce(
  (
    select jsonb_agg(
      jsonb_build_object(
        'label',
        case
          when key = 'live' then 'Live'
          when key = 'repo' then 'Repository'
          when key = 'detail' then 'Case Study'
          else key
        end,
        'url', value,
        'isPublic', true
      )
    )
    from jsonb_each_text(links)
  ),
  '[]'::jsonb
)
where jsonb_typeof(links) = 'object';

update public.projects
set links = '[]'::jsonb
where links is null or jsonb_typeof(links) not in ('array', 'object');

insert into public.schema_migrations (version, description)
values ('v2.2.0', 'comments/posts_comments 분리 + projects_comments 추가 + projects achievements/contributions 제거 + links 공개 플래그 보정')
on conflict (version) do nothing;

commit;
