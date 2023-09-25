create table
    matches (
        id uuid default uuid_generate_v4 () not null,
        user1_id uuid references auth.users (id) on delete cascade not null,
        user2_id uuid references auth.users (id) on delete cascade not null,
        active boolean not null default true,
        updated_at timestamptz not null default now(),
        primary key (id)
    );

-- Function to check for and create/re-activate match on 'like' interaction
create function handle_like_interaction () returns trigger as $$
declare
    is_match boolean;
    match matches%rowtype;
    user1_credits int;
    user2_credits int;
begin
    select into is_match
        exists (
            select
                1
            from
                interactions i1 
            join
                interactions i2 on i1.user_id = i2.target_id and i2.user_id = i1.target_id
            where
                i1.user_id = new.user_id and
                i1.interaction = 'like' and
                i2.interaction = 'like'
        );

    if is_match then
        -- Check for an existing match
        select into match *
        from matches
        where 
            ((user1_id = new.user_id and user2_id = new.target_id) or
            (user1_id = new.target_id and user2_id = new.user_id));

        if found then
            -- Reactivate the existing inactive match
            if match.active is not true then
                update matches
                set active = true, updated_at = now()
                where id = match.id;
            -- Match shouldn't already exist, but might (depending on trigger behavior)
            -- else
            --     raise exception 'Active match already exists';
            end if;
        else
            -- Check that both users have available credits
            select sum(credits) into user1_credits from credits where user_id = new.user_id;
            select sum(credits) into user2_credits from credits where user_id = new.target_id;

            -- Only create a new match if both users have a credit sum > 0
            if (user1_credits > 0) and (user2_credits > 0) then
                insert into matches (user1_id, user2_id)
                values (new.user_id, new.target_id);
            end if;
        end if;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Function to check for and deactivate match on 'non-like' interaction
create function handle_nonlike_interaction () returns trigger as $$
declare
    match_id uuid;
begin
    -- Check for an active match
    select into match_id id
    from matches
    where 
        ((user1_id = new.user_id and user2_id = new.target_id) or
        (user1_id = new.target_id and user2_id = new.user_id)) and
        active = true;

    if found then
        -- Deactivate the active match
        update matches
        set active = false, updated_at = now()
        where id = match_id;
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Function to check for and create matches on (positive) credits
create function handle_new_credits () returns trigger as $$
declare
    pending_match record;
    user1_credits int;
    user2_credits int;
begin
    -- Check for pending matches (mutual likes but no match yet)
    for pending_match in
    select
        i2.user_id as user2_id
    from
        interactions i1 
    join
        interactions i2 on i1.user_id = i2.target_id and i2.user_id = i1.target_id
    where
        i1.user_id = new.user_id and
        i1.interaction = 'like' and
        i2.interaction = 'like' and
        not exists (
            select 1
            from matches
            where 
                (user1_id = i1.user_id and user2_id = i2.user_id) or
                (user1_id = i2.user_id and user2_id = i1.user_id)
        )
    loop
        -- Check that both users have available credits
        select sum(credits) into user1_credits from credits where user_id = new.user_id;
        select sum(credits) into user2_credits from credits where user_id = pending_match.user2_id;

        -- Exit loop if user1 (a.k.a. new.user_id, who initiated the check) has no more credits
        exit when user1_credits <= 0;

        if (user2_credits > 0) then
            -- Create a new match
            insert into matches (user1_id, user2_id)
            values (new.user_id, pending_match.user2_id);
        end if;
    end loop;
    
    return new;
end;
$$ language plpgsql security definer;

create function handle_new_match () returns trigger as $$
begin
    insert into credits (user_id, creditor, creditor_id, credits)
    values 
        (new.user1_id, 'match', new.id::varchar, -1),
        (new.user2_id, 'match', new.id::varchar, -1);

    return new;
end;
$$ language plpgsql security definer;

alter table matches enable row level security;

create policy "Users can view own matches." on matches for
select
    using (
        auth.uid () = user1_id or
        auth.uid () = user2_id
    );

alter table matches force row level security;

-- Trigger to check for new match after 'like' interaction
create trigger after_like_interaction
after insert or
update on interactions for each row when (new.interaction = 'like')
execute function handle_like_interaction ();

-- Trigger to check for active match to deactivate after 'non-like' interaction
create trigger after_nonlike_interaction
after insert or
update on interactions for each row when (new.interaction != 'like')
execute function handle_nonlike_interaction ();

-- Trigger to check for new matches after changes to credits
create trigger after_credit_changes
after insert on credits for each row when (new.credits > 0)
execute function handle_new_credits ();

-- Trigger to deduct credits after a new match is created
create trigger after_match_created
after insert on matches for each row
execute function handle_new_match ();

-- Function to get active matches for the current user
create function get_active_matches () returns setof uuid as $$
begin
    return query
        select id
        from matches
        where
            active = true and
            (user1_id = auth.uid () or user2_id = auth.uid ());
end;
$$ language plpgsql;

create table
    messages (
        id uuid default uuid_generate_v4 () not null,
        match_id uuid references matches (id) on delete cascade not null,
        user_id uuid references auth.users (id) on delete cascade not null,
        message text not null,
        created_at timestamptz not null default now(),
        primary key (id)
    );

alter table messages enable row level security;

create policy "Users can add messages to their active matches." on messages for insert
with
    check (
        match_id in (
            select
                *
            from
                get_active_matches ()
        ) and
        auth.uid () = user_id
    );

create policy "Users can view messages from their active matches." on messages for
select
    using (
        match_id in (
            select
                *
            from
                get_active_matches ()
        )
    );

create policy "Users can delete their own messages." on messages for delete using (auth.uid () = user_id);

alter table messages force row level security;
