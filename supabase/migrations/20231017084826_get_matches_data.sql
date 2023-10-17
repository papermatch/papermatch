alter table messages
add column is_read boolean default false not null;

create function set_message_read (msg_id uuid) returns boolean as $$
declare
    is_valid boolean;
begin
    select exists (
        select 1 
        from public.messages msg
        join public.matches match on msg.match_id = match.id
        where msg.id = msg_id and msg.is_read = false and
        (
            (match.user1_id = msg.user_id and match.user2_id = auth.uid ()) or
            (match.user2_id = msg.user_id and match.user1_id = auth.uid ())
        )
    ) into is_valid;

    if is_valid then
        update public.messages
        set is_read = true
        where id = msg_id;
        return true;
    else
        return false;
    end if;
end;
$$ language plpgsql security definer;

create function get_matches_data () returns table (
    match public.matches,
    profile public.profiles,
    message public.messages,
    unread boolean
) as $$
begin
    return query
    with active_matches as (
        select * from public.get_active_matches()
    ),
    latest_messages as (
        select distinct on (match_id)
            *
        from public.messages
        where match_id in (select id from active_matches)
        order by match_id, created_at desc
    ),
    unread_messages as (
        select
            match_id,
            case when count(*) > 0 then true else false end as unread
        from public.messages
        where is_read = false and user_id != auth.uid()
        group by match_id
    )
    select
        am::public.matches,
        p::public.profiles,
        case when lm is not null then lm::public.messages else null end,
        coalesce(um.unread, false) as unread
    from active_matches am
    join public.profiles p on p.id = case when am.user1_id = auth.uid() then am.user2_id else am.user1_id end
    left join latest_messages lm on lm.match_id = am.id
    left join unread_messages um on um.match_id = am.id
    order by coalesce(lm.created_at, am.updated_at) desc;
end;
$$ language plpgsql security definer;
