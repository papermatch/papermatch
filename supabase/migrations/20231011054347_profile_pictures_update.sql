drop trigger before_profile_changes on profiles;

drop function delete_old_avatar ();

alter table profiles
drop column if exists avatar_url;

alter table profiles
add column avatar_urls text[] default '{}' not null;

create or
replace function delete_old_avatars () returns trigger language 'plpgsql' security definer as $$
declare
    status int;
    content text;
    avatar_url text;
begin
    foreach avatar_url in array old.avatar_urls loop
        if (tg_op = 'DELETE' or not (avatar_url = any(new.avatar_urls))) then
            select
                into status, content
                result.status, result.content
                from public.delete_avatar(avatar_url) as result;
            if status <> 200 then
                raise warning 'Could not delete avatar (%): % %', avatar_url, status, content;
            end if;
        end if;
    end loop;
    if tg_op = 'DELETE' then
        return old;
    end if;
    return new;
end;
$$;

create trigger before_profile_changes before
update of avatar_urls or
delete on public.profiles for each row
execute function public.delete_old_avatars ();

create function public.get_user_distance (user1_id uuid, user2_id uuid) returns float as $$
declare
    p1 public.profiles%rowtype;
    p2 public.profiles%rowtype;
begin
    select into p1 * from public.profiles where id = user1_id;
    select into p2 * from public.profiles where id = user2_id;

    if p1.lnglat is null or p2.lnglat is null then
        return null;
    else
        return p1.lnglat <@> p2.lnglat;
    end if;
end;
$$ language plpgsql security definer;

alter function public.get_compatibility_score (uuid, uuid)
rename to get_user_score;

drop function get_compatible_profiles ();

create function public.search_active_profiles () returns table (
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
        where
            p.id != auth.uid()
    )
    select
        p, d, s
    from
        q
    order by
        s desc;
end;
$$ language plpgsql security definer;
