create extension cube;

create extension earthdistance;

create type gender_type as enum('male', 'female', 'nonbinary');

create type kids_type as enum('none', 'unsure', 'want', 'have', 'more');

create type intention_type as enum(
    'unsure',
    'casual',
    'serious',
    'marriage',
    'friends'
);

create type relationship_type as enum('unsure', 'monog', 'enm');

create type diet_type as enum(
    'omnivore',
    'pescatarian',
    'vegetarian',
    'vegan',
    'kosher',
    'halal',
    'gluten',
    'other'
);

alter table profiles
drop column if exists website;

alter table profiles
drop column if exists full_name;

alter table profiles
add column birthday date;

alter table profiles
add column gender gender_type;

alter table profiles
add column kids kids_type;

alter table profiles
add column intention intention_type;

alter table profiles
add column relationship relationship_type;

alter table profiles
add column diet diet_type;

alter table profiles
add column lnglat point;

alter table profiles
add column about text;

create function public.delete_current_user () returns void as $$
begin
    delete from auth.users where id = auth.uid();
    return; 
end;
$$ language plpgsql security definer;

create type sort_type as enum('none', 'distance', 'recent');

create table
    public.preferences (
        id uuid references auth.users (id) on delete cascade not null,
        min_age int,
        max_age int,
        gender public.gender_type[],
        kids public.kids_type[],
        intention public.intention_type[],
        relationship public.relationship_type[],
        diet public.diet_type[],
        radius float,
        keywords text[],
        updated_at timestamptz not null default now(),
        primary key (id)
    );

alter table public.preferences enable row level security;

create policy "Users can see own preferences." on public.preferences for
select
    using (auth.uid () = id);

create policy "Users can update own preferences." on public.preferences for
update using (auth.uid () = id);

alter table public.preferences force row level security;

create or
replace function public.handle_new_user () returns trigger as $$
begin
    insert into public.profiles (id, username, birthday)
    values (new.id, new.raw_user_meta_data->>'username', (new.raw_user_meta_data->>'birthday')::date);

    insert into public.credits (user_id, creditor, credits, created_at)
    VALUES (new.id, 'init', 1, now());
    
    insert into public.preferences (id)
    values (new.id);

    return new;
end;
$$ language plpgsql security definer;

-- Helper function for overriding current_date in tests
create function public.current_date_override () returns date as $$
begin
    return current_date;
end;
$$ language plpgsql security definer;

create function public.get_compatibility_score (user1_id uuid, user2_id uuid) returns float as $$
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

    if q1.min_age is not null then
        d := d + 1;
        if p2.birthday is not null and extract(
            year from age(current_date_override(), p2.birthday)
        ) >= q1.min_age then
            n := n + 1;
        end if;
    end if;

    if q1.max_age is not null then
        d := d + 1;
        if p2.birthday is not null and extract(
            year from age(current_date_override(), p2.birthday)
        ) <= q1.max_age then
            n := n + 1;
        end if;
    end if;

    if q1.gender is not null then
        d := d + 1;
        if p2.gender is not null and q1.gender && array[p2.gender] then
            n := n + 1;
        end if;
    end if;

    if q1.kids is not null then
        d := d + 1;
        if p2.kids is not null and q1.kids && array[p2.kids] then
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

    if q1.radius is not null and p1.lnglat is not null then
        d := d + 1;
        if p2.lnglat is not null and p1.lnglat <@> p2.lnglat <= q1.radius then
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
$$ language plpgsql security definer;

create function public.get_compatible_profiles () returns table (profile public.profiles, score float) as $$
begin
    return query
    with q as (
        select 
            p, public.get_compatibility_score(auth.uid(), p.id) as s
        from 
            public.get_active_profiles() as p
        where 
            p.id != auth.uid()
    )
    select 
        p, s
    from 
        q
    order by 
        s desc;
end;
$$ language plpgsql security definer;
