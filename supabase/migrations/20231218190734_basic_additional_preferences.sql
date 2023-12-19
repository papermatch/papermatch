create or
replace function public.get_user_score (user1_id uuid, user2_id uuid) returns float as $$
declare
    p1 public.profiles%rowtype;
    p2 public.profiles%rowtype;
    q1 public.preferences%rowtype;
    n int := 0;
    d int := 0;
begin
    select into p1 * from public.profiles where id = user1_id;
    select into p2 * from public.profiles where id = user2_id;
    select into q1 * from public.preferences where id = user1_id;

    -- Basic preferences return 0 if not matched
    if q1.min_age is not null then
        d := d + 1;
        if p2.birthday is not null and extract(
            year from age(current_date_override(), p2.birthday)
        ) >= q1.min_age then
            n := n + 1;
        else
            return 0::float;
        end if;
    end if;

    if q1.max_age is not null then
        d := d + 1;
        if p2.birthday is not null and extract(
            year from age(current_date_override(), p2.birthday)
        ) <= q1.max_age then
            n := n + 1;
        else
            return 0::float;
        end if;
    end if;

    if q1.radius is not null and p1.lnglat is not null then
        d := d + 1;
        if p2.lnglat is not null and p1.lnglat <@> p2.lnglat <= q1.radius then
            n := n + 1;
        else
            return 0::float;
        end if;
    end if;

    -- Additional preferences don't return 0 if not matched
    if q1.gender is not null then
        d := d + 1;
        if p2.gender is not null and q1.gender && array[p2.gender] then
            n := n + 1;
        end if;
    end if;

    if q1.education is not null then
        d := d + 1;
        if p2.education is not null and q1.education && array[p2.education] then
            n := n + 1;
        end if;
    end if;

    if q1.religion is not null then
        d := d + 1;
        if p2.religion is not null and q1.religion && array[p2.religion] then
            n := n + 1;
        end if;
    end if;

    if q1.sexuality is not null then
        d := d + 1;
        if p2.sexuality is not null and q1.sexuality && array[p2.sexuality] then
            n := n + 1;
        end if;
    end if;

    if q1.family is not null then
        d := d + 1;
        if p2.family is not null and q1.family && array[p2.family] then
            n := n + 1;
        end if;
    end if;

    if q1.intention is not null then
        d := d + 1;
        if p2.intention is not null and q1.intention && array[p2.intention] then
            n := n + 1;
        end if;
    end if;

    if q1.relationship is not null then
        d := d + 1;
        if p2.relationship is not null and q1.relationship && array[p2.relationship] then
            n := n + 1;
        end if;
    end if;

    if q1.diet is not null then
        d := d + 1;
        if p2.diet is not null and q1.diet && array[p2.diet] then
            n := n + 1;
        end if;
    end if;

    if q1.keywords is not null then
        d := d + 1;
        if p2.about is not null and exists (
            select 1
            from unnest(q1.keywords) as keyword
            where p2.about ilike '%' || keyword || '%'
        ) then
            n := n + 1;
        end if;
    end if;

    if d = 0 then
        return null;
    else
        return 9::float * n::float / d::float + 1::float;
    end if;
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
        -- s = null means no preferences set
        -- s = 0.0 means basic preference(s) not matched
        -- s = 10.0 means all preferences matched
        s is null or (s > 0.0 and (not hide_preferences or s >= 10.0))
    order by
        s desc;
end;
$$ language plpgsql security definer;
