create type reason_type as enum(
    'contact',
    'fake',
    'harassment',
    'inappropriate',
    'selling',
    'underage',
    'other'
);

create table
    reports (
        id uuid default uuid_generate_v4 () not null,
        user_id uuid references auth.users (id) on delete cascade not null,
        reporter_id uuid references auth.users (id) on delete cascade not null,
        reason reason_type not null,
        details text,
        created_at timestamptz not null default now(),
        primary key (id)
    );

alter table reports enable row level security;

create policy "Users can report as themselves." on reports for insert
with
    check (auth.uid () = reporter_id);

create policy "User can report other users (but not themselves)." on reports as restrictive for insert
with
    check (auth.uid () <> user_id);

alter table reports force row level security;
