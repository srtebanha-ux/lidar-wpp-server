-- OrçaGuard — schema inicial
-- Apply with: supabase db push

create extension if not exists "uuid-ossp";

-- ── Profiles (extends auth.users) ─────────────────────────

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  org_name    text,
  plan        text not null default 'free',   -- free | avulso | sindico | administradora
  credits     int  not null default 0,
  logo_url    text,
  created_at  timestamptz not null default now()
);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Analyses ──────────────────────────────────────────────

create type analysis_status as enum ('pending', 'extracting', 'analyzing', 'done', 'failed');

create table analyses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  title        text not null,
  work_type    text not null,
  description  text,
  status       analysis_status not null default 'pending',
  result       jsonb,
  report_url   text,
  error        text,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index analyses_user_id_idx on analyses(user_id);
create index analyses_status_idx on analyses(status);

-- ── Documents ─────────────────────────────────────────────

create table documents (
  id            uuid primary key default gen_random_uuid(),
  analysis_id   uuid not null references analyses(id) on delete cascade,
  file_url      text not null,
  original_name text,
  vendor_name   text,
  extraction    jsonb,
  pages         int,
  created_at    timestamptz not null default now()
);

create index documents_analysis_id_idx on documents(analysis_id);

-- ── Payments ──────────────────────────────────────────────

create table payments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  mp_payment_id  text unique,
  type           text not null,   -- one_time | subscription
  plan           text not null,
  amount         numeric(10,2),
  status         text not null,   -- approved | pending | refunded
  created_at     timestamptz not null default now()
);

create index payments_user_id_idx on payments(user_id);
create index payments_mp_id_idx on payments(mp_payment_id);

-- ── Row Level Security ────────────────────────────────────

alter table profiles  enable row level security;
alter table analyses  enable row level security;
alter table documents enable row level security;
alter table payments  enable row level security;

-- profiles: user sees/updates only own row
create policy "profiles: own row" on profiles
  for all using (auth.uid() = id);

-- analyses: user sees only own analyses
create policy "analyses: own rows" on analyses
  for all using (auth.uid() = user_id);

-- documents: visible through analyses ownership
create policy "documents: via analysis" on documents
  for all using (
    exists (
      select 1 from analyses
      where analyses.id = documents.analysis_id
        and analyses.user_id = auth.uid()
    )
  );

-- payments: user sees only own payments
create policy "payments: own rows" on payments
  for all using (auth.uid() = user_id);
