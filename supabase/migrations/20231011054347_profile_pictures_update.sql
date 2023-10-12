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
