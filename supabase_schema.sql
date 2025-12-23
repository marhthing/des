-- SFGS Admin Portal: Supabase Table Schema

-- Students table
create table "Student" (
  id uuid primary key default gen_random_uuid(),
  matric_number text unique not null,
  student_name text not null,
  date_of_birth date not null,
  parent_email_1 text,
  parent_email_2 text,
  created_at timestamptz not null default now()
);

-- UploadedFile table
create table "UploadedFile" (
  id uuid primary key default gen_random_uuid(),
  original_file_name text not null,
  matric_number_raw text not null,
  matric_number_parsed text not null,
  student_id uuid references "Student"(id),
  status text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

-- EmailQueue table
create table "EmailQueue" (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references "Student"(id),
  matric_number text not null,
  recipient_email text not null,
  email_type text not null,
  status text not null,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- SystemSettings table
create table "SystemSettings" (
  id integer primary key default 1,
  daily_email_limit integer not null,
  sender_email text not null,
  email_interval_minutes integer not null,
  updated_at timestamptz not null default now()
);

-- SystemLog table
create table "SystemLog" (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  created_at timestamptz not null default now()
);
