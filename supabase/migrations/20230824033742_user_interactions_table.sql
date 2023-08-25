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

create policy "User can add own interactions (but not with themselves)." on interactions for insert
with
    check (
        auth.uid () = user_id and
        user_id <> target_id
    );

create policy "Users can update own interactions." on interactions for
update using (auth.uid () = user_id);

alter table interactions force row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;

create policy "Non-blocked-by profiles are viewable." on profiles for
select
    using (
        id not in (
            select
                user_id
            from
                interactions
            where
                target_id = auth.uid () and
                interaction = 'block'
        )
    );

alter table profiles force row level security;
