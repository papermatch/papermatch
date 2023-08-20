create extension http
with
  schema extensions;

create or
replace function delete_storage_object (
  bucket text,
  object text,
  out status int,
  out content text
) returns record language 'plpgsql' security definer as $$
declare
  project_url text;
  service_role_key text;
  url text;
begin
  select decrypted_secret 
    into project_url 
    from vault.decrypted_secrets 
    where name = 'SUPABASE_URL';
  select decrypted_secret 
    into service_role_key 
    from vault.decrypted_secrets 
    where name = 'SUPABASE_SERVICE_ROLE_KEY';
  url := project_url||'/storage/v1/object/'||bucket||'/'||object;
  raise notice 'Deleting object % from bucket %', object, bucket;
  select
      into status, content
           result.status::int, result.content::text
      FROM extensions.http((
    'DELETE',
    url,  
    ARRAY[extensions.http_header('authorization','Bearer '||service_role_key)],
    NULL,
    NULL)::extensions.http_request) as result;
end;
$$;

create or
replace function delete_avatar (avatar_url text, out status int, out content text) returns record language 'plpgsql' security definer as $$
declare
  object text;
begin
  object := substring(avatar_url from '/([^/]+)(\?|$)');
  select
      into status, content
           result.status, result.content
      from public.delete_storage_object('avatars', object) as result;
end;
$$;

create or
replace function delete_old_avatar () returns trigger language 'plpgsql' security definer as $$
declare
  status int;
  content text;
begin
  if coalesce(old.avatar_url, '') <> ''
      and (tg_op = 'DELETE' or (old.avatar_url <> new.avatar_url)) then
    select
      into status, content
      result.status, result.content
      from public.delete_avatar(old.avatar_url) as result;
    if status <> 200 then
      raise warning 'Could not delete avatar (%): % %', old.avatar_url, status, content;
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger before_profile_changes before
update of avatar_url or
delete on public.profiles for each row
execute function public.delete_old_avatar ();

create or
replace function delete_old_profile () returns trigger language 'plpgsql' security definer as $$
begin
  delete from public.profiles where id = old.id;
  return old;
end;
$$;

create trigger before_delete_user before delete on auth.users for each row
execute function public.delete_old_profile ();
