create type interaction_type as enum('none', 'block', 'pass', 'like');

create table
    interactions (
        user_id uuid references auth.users (id) on delete cascade not null,
        target_id uuid references auth.users (id) on delete cascade not null,
        interaction interaction_type not null,
        updated_at timestamptz not null default now(),
        primary key (user_id, target_id)
    );

alter table interactions enable row level security;

create policy "User can see own interactions." on interactions for
select
    using (auth.uid () = user_id);

create policy "User can add own interactions." on interactions for insert
with
    check (auth.uid () = user_id);

create policy "Users can update own interactions." on interactions for
update using (auth.uid () = user_id);

alter table interactions force row level security;
