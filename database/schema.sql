-- ==========================================
-- GS ACADEMY MASTER DATABASE
-- PART 1
-- ==========================================

create extension if not exists "uuid-ossp";

--------------------------------------------------
-- STUDENTS
--------------------------------------------------

create table if not exists students (

    id uuid primary key default uuid_generate_v4(),

    auth_id uuid unique,

    full_name text not null,

    email text unique not null,

    phone text,

    parent_name text,

    parent_phone text,

    country text,

    academic_level text,

    created_at timestamptz default now()

);

--------------------------------------------------
-- TUTORS
--------------------------------------------------

create table if not exists tutors (

    id uuid primary key default uuid_generate_v4(),

    auth_id uuid unique,

    full_name text not null,

    email text unique,

    phone text,

    subjects text[],

    status text default 'active',

    created_at timestamptz default now()

);

--------------------------------------------------
-- SUBJECTS
--------------------------------------------------

create table if not exists subjects (

    id uuid primary key default uuid_generate_v4(),

    name text unique not null

);

--------------------------------------------------
-- PACKAGES
--------------------------------------------------

create table if not exists packages (

    id uuid primary key default uuid_generate_v4(),

    package_name text,

    lessons_per_week integer,

    type text

);
--------------------------------------------------
-- TUTOR ASSIGNMENTS
--------------------------------------------------

create table if not exists tutor_assignments (

    id uuid primary key default uuid_generate_v4(),

    tutor_id uuid references tutors(id) on delete cascade,

    student_id uuid references students(id) on delete cascade,

    subject_id uuid references subjects(id),

    package_id uuid references packages(id),

    active boolean default true,

    created_at timestamptz default now()

);

--------------------------------------------------
-- TIMETABLE
--------------------------------------------------

create table if not exists timetable (

    id uuid primary key default uuid_generate_v4(),

    tutor_assignment_id uuid references tutor_assignments(id),

    lesson_date date,

    lesson_time time,

    duration integer default 60,

    google_meet_link text,

    status text default 'scheduled',

    created_at timestamptz default now()

);

--------------------------------------------------
-- HOMEWORK
--------------------------------------------------

create table if not exists homework (

    id uuid primary key default uuid_generate_v4(),

    tutor_assignment_id uuid references tutor_assignments(id),

    title text,

    instructions text,

    due_date date,

    attachment_url text,

    created_at timestamptz default now()

);
--------------------------------------------------
-- CLASSWORK
--------------------------------------------------

create table if not exists classwork (

    id uuid primary key default uuid_generate_v4(),

    tutor_assignment_id uuid references tutor_assignments(id),

    title text,

    instructions text,

    attachment_url text,

    created_at timestamptz default now()

);

--------------------------------------------------
-- RESOURCES
--------------------------------------------------

create table if not exists resources (

    id uuid primary key default uuid_generate_v4(),

    tutor_assignment_id uuid references tutor_assignments(id),

    title text,

    resource_type text,

    file_url text,

    created_at timestamptz default now()

);

--------------------------------------------------
-- ANNOUNCEMENTS
--------------------------------------------------

create table if not exists announcements (

    id uuid primary key default uuid_generate_v4(),

    title text,

    message text,

    audience text,

    created_at timestamptz default now()

);
--------------------------------------------------
-- SCORES
--------------------------------------------------

create table if not exists scores (

    id uuid primary key default uuid_generate_v4(),

    classwork_submission_id uuid,

    score integer,

    total integer,

    percentage integer,

    feedback text,

    correction_url text,

    created_at timestamptz default now()

);

--------------------------------------------------
-- NOTIFICATIONS
--------------------------------------------------

create table if not exists notifications (

    id uuid primary key default uuid_generate_v4(),

    student_id uuid references students(id),

    title text,

    message text,

    is_read boolean default false,

    created_at timestamptz default now()

);