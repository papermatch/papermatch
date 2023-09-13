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
    where name = 'SUPABASE_API_URL';
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
