create type creditor_type as enum('init', 'match', 'stripe');

create table
    credits (
        id uuid default uuid_generate_v4 () not null,
        user_id uuid references auth.users (id) on delete cascade not null,
        creditor creditor_type not null,
        creditor_id varchar(255),
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

create or
replace function public.handle_new_user () returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

    insert into public.credits (user_id, creditor, credits, created_at)
    VALUES (new.id, 'init', 1, now());

    return new;
end;
$$ language plpgsql security definer;

create function public.get_active_profiles () returns setof profiles as $$
begin
    return query
        select p.*
        from public.profiles as p
        join (
            select user_id
            from public.credits
            group by user_id
            having sum(credits) > 0
        ) as c on p.id = c.user_id;
end;
$$ language plpgsql security definer;

grant
execute on function public.get_active_profiles () to public;
