-- College WhatsApp Notification System — initial schema
-- Matches Server/server.md § Database Models. Students/Parents are
-- intentionally not modeled yet (see server.md § Excluded Modules /
-- Recipient Filtering placeholder note).

create extension if not exists "pgcrypto";

-- ============================================================
-- branches
-- ============================================================
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- courses (years/semesters are derived, never stored — see
-- shared/utils/academicStructure.ts)
-- ============================================================
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  code text not null,
  total_years int not null check (total_years > 0),
  semesters_per_year int not null check (semesters_per_year > 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, code)
);

create index if not exists idx_courses_branch_id on public.courses(branch_id);

-- ============================================================
-- faculty — backs BOTH auth roles (SUPER_ADMIN and FACULTY).
-- id is the Supabase Auth user id (1:1), created via
-- integrations/auth.createAuthUser then inserted here.
-- ============================================================
create table if not exists public.faculty (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('SUPER_ADMIN', 'FACULTY')),
  branch_id uuid references public.branches(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faculty_branch_required check (
    (role = 'FACULTY' and branch_id is not null) or (role = 'SUPER_ADMIN')
  )
);

create index if not exists idx_faculty_branch_id on public.faculty(branch_id);

-- ============================================================
-- notification_templates
-- ============================================================
create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_template_name text not null unique,
  category text not null check (category in ('UTILITY', 'MARKETING')),
  variables jsonb not null default '[]'::jsonb,
  attachment_allowed boolean not null default false,
  button_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- notifications
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.notification_templates(id) on delete restrict,
  title text not null,
  message text not null,
  attachment_url text,
  attachment_type text,
  button_label text,
  button_url text,

  -- Recipient Filtering (server.md): Branch / Course / Year / Semester / Audience
  branch_id uuid references public.branches(id) on delete restrict,
  course_id uuid references public.courses(id) on delete restrict,
  target_year int,
  target_semester int,
  audience text[] not null default '{}',

  created_by uuid not null references public.faculty(id) on delete restrict,
  scheduled_at timestamptz,
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'SCHEDULED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notifications_branch_id on public.notifications(branch_id);
create index if not exists idx_notifications_status on public.notifications(status);
create index if not exists idx_notifications_created_by on public.notifications(created_by);

-- ============================================================
-- notification_logs
-- recipient_id has no FK yet — Student/Parent tables don't exist until
-- those modules are built (see server.md § Excluded Modules).
-- ============================================================
create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  recipient_id uuid not null,
  recipient_type text not null check (recipient_type in ('STUDENT', 'PARENT')),
  phone text not null,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
  whatsapp_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_logs_notification_id on public.notification_logs(notification_id);
create index if not exists idx_notification_logs_whatsapp_message_id on public.notification_logs(whatsapp_message_id);
create index if not exists idx_notification_logs_status on public.notification_logs(status);

-- ============================================================
-- updated_at auto-touch trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_branches_updated_at before update on public.branches
  for each row execute function public.set_updated_at();
create trigger trg_courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
create trigger trg_faculty_updated_at before update on public.faculty
  for each row execute function public.set_updated_at();
create trigger trg_notification_templates_updated_at before update on public.notification_templates
  for each row execute function public.set_updated_at();
create trigger trg_notifications_updated_at before update on public.notifications
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS: all access goes through the backend using the Supabase
-- service role key, which bypasses RLS. Enabled with no policies
-- so anon/authenticated keys can't read/write directly even if
-- leaked to a client.
-- ============================================================
alter table public.branches enable row level security;
alter table public.courses enable row level security;
alter table public.faculty enable row level security;
alter table public.notification_templates enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_logs enable row level security;
