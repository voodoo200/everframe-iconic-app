-- Выполните в Supabase SQL Editor ОДИН раз.
create extension if not exists pgcrypto;
create table if not exists public.workspaces (id uuid primary key default gen_random_uuid(), name text not null);
create table if not exists public.workspace_members (
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','assistant')),
 primary key(workspace_id,user_id)
);
create table if not exists public.contacts (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 name text not null check(length(name) between 1 and 200), company text, profession text, city text, country text,
 contact text, link text, type text not null default 'Участник',
 priority text not null default 'B' check(priority in ('A','B','C')),
 status text not null default 'Новый контакт', next date, amount numeric(14,2),
 reason text, notes text, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists contacts_workspace_idx on public.contacts(workspace_id,created_at desc);
create index if not exists contacts_status_idx on public.contacts(workspace_id,status);
create unique index if not exists contacts_link_unique on public.contacts(workspace_id,lower(trim(link))) where link is not null and length(trim(link))>0;
create unique index if not exists contacts_contact_unique on public.contacts(workspace_id,lower(trim(contact))) where contact is not null and length(trim(contact))>0;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.contacts enable row level security;
-- SECURITY DEFINER only checks current user's membership, not arbitrary user identities.
create or replace function public.is_workspace_member(wid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.workspace_members m where m.workspace_id=wid and m.user_id=(select auth.uid()));
$$;
revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
create policy "members can read own workspace" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "members can see own memberships" on public.workspace_members for select to authenticated using (user_id=(select auth.uid()));
create policy "members can read contacts" on public.contacts for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members can insert contacts" on public.contacts for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members can update contacts" on public.contacts for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members can delete contacts" on public.contacts for delete to authenticated using (public.is_workspace_member(workspace_id));
-- Создание workspace и выдача прав делаются ТОЛЬКО администратором через SQL Editor.
