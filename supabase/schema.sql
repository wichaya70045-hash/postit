-- Migration for "กระดานระบายใจ" (Yaninboard)
-- Run this in your Supabase SQL Editor

-- 1. Notes table
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('text', 'drawing')),
  body text,
  strokes jsonb,
  caption text,
  color text not null default 'yellow' check (color in ('yellow', 'pink', 'blue', 'green', 'purple', 'orange')),
  mood text check (mood in ('tired', 'sad', 'angry', 'confused', 'happy', null)),
  rotation real not null default 0,
  status text not null default 'visible' check (status in ('visible', 'hidden', 'pending_review')),
  risk_flag boolean not null default false,
  report_count integer not null default 0,
  reaction_counts jsonb not null default '{"hug": 0, "me_too": 0, "understand": 0, "cheer": 0}'::jsonb,
  created_at timestamptz not null default now(),
  device_hash text not null,
  edit_token_hash text not null
);

-- 2. Reactions table
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade not null,
  device_hash text not null,
  type text not null check (type in ('hug', 'me_too', 'understand', 'cheer')),
  created_at timestamptz not null default now(),
  constraint unique_note_device_reaction unique (note_id, device_hash, type)
);

-- 3. Reports table
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade not null,
  device_hash text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- 4. Admin actions table
create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null,
  note_id uuid references notes(id) on delete cascade not null,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_notes_status_created_at on notes(status, created_at desc);
create index if not exists idx_notes_mood on notes(mood) where status = 'visible';
create index if not exists idx_notes_device_hash on notes(device_hash);
create index if not exists idx_reactions_note_id on reactions(note_id);
create index if not exists idx_reports_note_id on reports(note_id);

-- Row Level Security (RLS)
alter table notes enable row level security;
alter table reactions enable row level security;
alter table reports enable row level security;
alter table admin_actions enable row level security;

-- Public can read visible notes
create policy "Anyone can read visible notes"
  on notes for select
  using (status = 'visible');

-- Public can read reactions for visible notes
create policy "Anyone can read reactions"
  on reactions for select
  using (true);

-- Realtime publication for notes and reactions
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table reactions;

