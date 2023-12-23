create function public.get_mean_score (s1 float, s2 float) returns float as $$
begin
    -- s1 if either user has no preferences set
    if s1 is null or s2 is null then
        return s1;
    end if;

    -- 0.0 if either user's basic preferences are not matched
    if s1 = 0.0 or s2 = 0.0 then
        return 0.0;
    end if;

    -- harmonic mean otherwise
    return 2.0 * s1 * s2 / (s1 + s2);
end;
$$ language plpgsql;

create or
replace function public.search_active_profiles (
    hide_interactions boolean default false,
    hide_preferences boolean default false
) returns table (
    profile public.profiles,
    distance float,
    score float
) as $$
begin
    return query
    with q1 as (
        select
            p,
            public.get_user_distance(auth.uid(), p.id) as d,
            public.get_user_score(auth.uid(), p.id) as s1,
            public.get_user_score(p.id, auth.uid()) as s2
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
    ),
    q2 as (
        select
            q1.p as p,
            q1.d as d,
            q1.s1 as s1,
            public.get_mean_score(q1.s1, q1.s2) as s
        from
            q1
    )
    select
        q2.p, q2.d, q2.s
    from
        q2
    where
        -- s = null means no preferences set
        -- s = 0.0 means basic preference(s) not matched
        -- s = 10.0 means all preferences matched
        q2.s is null or (q2.s > 0.0 and (not hide_preferences or q2.s1 >= 10.0))
    order by
        q2.s desc;
end;
$$ language plpgsql security definer;
