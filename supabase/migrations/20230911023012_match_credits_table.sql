create type creditor_type as enum('match', 'stripe');

create table
    credits (
        id uuid default uuid_generate_v4 () not null,
        user_id uuid references auth.users (id) on delete cascade not null,
        creditor creditor_type not null,
        creditor_id varchar(255) not null,
        credits integer not null,
        created_at timestamptz not null default now(),
        primary key (id)
    );

create index idx_credits_user_id on credits (user_id);

alter table credits enable row level security;

create policy "User can see own credits." on credits for
select
    using (auth.uid () = user_id);

alter table credits force row level security;
