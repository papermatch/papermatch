create extension cube;

create extension earthdistance;

create type gender_type as enum('male', 'female', 'nonbinary');

create type kids_type as enum('none', 'unsure', 'want', 'have', 'more');

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
add column location point;

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
    public.settings (
        id uuid references auth.users (id) on delete cascade not null,
        min_age int,
        max_age int,
        gender public.gender_type[],
        kids public.kids_type[],
        radius float,
        keywords text[],
        updated_at timestamptz not null default now(),
        primary key (id)
    );

alter table public.settings enable row level security;

create policy "Users can see own settings." on public.settings for
select
    using (auth.uid () = id);

create policy "Users can update own settings." on public.settings for
update using (auth.uid () = id);

alter table public.settings force row level security;

create or
replace function public.handle_new_user () returns trigger as $$
begin
    insert into public.profiles (id, username, birthday)
    values (new.id, new.raw_user_meta_data->>'username', (new.raw_user_meta_data->>'birthday')::date);

    insert into public.credits (user_id, creditor, credits, created_at)
    VALUES (new.id, 'init', 1, now());
    
    insert into public.settings (id)
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

create function public.is_profile_compatible (user1_id uuid, user2_id uuid) returns boolean as $$
declare
    s1 public.settings%rowtype;
    p1 public.profiles%rowtype;
    p2 public.profiles%rowtype;
begin
    select into s1 * from public.settings where id = user1_id;
    select into p1 * from public.profiles where id = user1_id;
    select into p2 * from public.profiles where id = user2_id;

    if s1.min_age is not null then
        if p2.birthday is null or extract(
            year from age(current_date_override(), p2.birthday)
        ) < s1.min_age then
            return false;
        end if;
    end if;

    if s1.max_age is not null then
        if p2.birthday is null or extract(
            year from age(current_date_override(), p2.birthday)
        ) > s1.max_age then
            return false;
        end if;
    end if;

    if s1.gender is not null then
        if p2.gender is null or array_position(s1.gender, p2.gender) is null then
            return false;
        end if;
    end if;

    if s1.kids is not null then
        if p2.kids is null or array_position(s1.kids, p2.kids) is null then
            return false;
        end if;
    end if;

    if s1.radius is not null and p1.location is not null then
        if p2.location is null or p1.location <@> p2.location > s1.radius then
            return false;
        end if;
    end if;

    if s1.keywords is not null then
        if p2.about is null or not exists (
            select 1 
            from unnest(s1.keywords) as keyword
            where p2.about ilike '%' || keyword || '%'
        ) then
            return false;
        end if;
    end if;

    return true;
end;
$$ language plpgsql security definer;

create function public.get_compatible_profiles () returns setof profiles as $$
begin
    return query
        select p.*
        from 
            public.get_active_profiles() as p
        where
            public.is_profile_compatible (auth.uid(), p.id)
        and
            public.is_profile_compatible (p.id, auth.uid());
end;
$$ language plpgsql security definer;
