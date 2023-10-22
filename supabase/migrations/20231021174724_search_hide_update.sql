drop function public.search_active_profiles ();

create function public.search_active_profiles (
    hide_interactions boolean default false,
    hide_preferences boolean default false
) returns table (
    profile public.profiles,
    distance float,
    score float
) as $$
begin
    return query
    with q as (
        select
            p,
            public.get_user_distance(auth.uid(), p.id) as d,
            public.get_user_score(auth.uid(), p.id) as s
        from
            public.get_active_profiles() as p
            left join public.interactions i on i.user_id = auth.uid() and i.target_id = p.id
        where
            p.id != auth.uid()
            and (
                i.interaction is null
                or (
                    i.interaction != 'block'
                    and (
                        not hide_interactions or i.interaction = 'none'
                    )
                )
            )
    )
    select
        p, d, s
    from
        q
    where
        not hide_preferences or s >= 10.0 or s is null
    order by
        s desc;
end;
$$ language plpgsql security definer;
