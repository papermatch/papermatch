create or
replace function handle_like_interaction () returns trigger as $$
declare
    is_match boolean;
    match matches%rowtype;
    user1_credits int;
    user2_credits int;
begin
    -- We know that user_id likes target_id, but does target_id like user_id?
    select into is_match
        exists (
            select
                1
            from
                public.interactions i
            where
                i.user_id = new.target_id and
                i.target_id = new.user_id and
                i.interaction = 'like'
        );

    if is_match then
        -- Check for an existing match
        select into match *
        from public.matches
        where
            ((user1_id = new.user_id and user2_id = new.target_id) or
            (user1_id = new.target_id and user2_id = new.user_id));

        if found then
            -- Reactivate the existing inactive match
            if match.active is not true then
                update public.matches
                set active = true, updated_at = now()
                where id = match.id;
            -- Match shouldn't already exist, but might (depending on trigger behavior)
            -- else
            --     raise exception 'Active match already exists';
            end if;
        else
            -- Check that both users have available credits
            select sum(credits) into user1_credits from public.credits where user_id = new.user_id;
            select sum(credits) into user2_credits from public.credits where user_id = new.target_id;

            -- Only create a new match if both users have a credit sum > 0
            if (user1_credits > 0) and (user2_credits > 0) then
                insert into public.matches (user1_id, user2_id)
                values (new.user_id, new.target_id);
            end if;
        end if;
    end if;

    return new;
end;
$$ language plpgsql security definer;
