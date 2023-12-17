create or
replace function public.send_onesignal_notify (user_id uuid, contents text) returns boolean as $$
declare
    project_url text;
    service_role_key text;
    status int;
begin
    select decrypted_secret
        into project_url
        from vault.decrypted_secrets
        where name = 'SUPABASE_URL';
    if project_url is null then
        return false;
    end if;

    select decrypted_secret
        into service_role_key
        from vault.decrypted_secrets
        where name = 'SUPABASE_SERVICE_ROLE_KEY';
    if service_role_key is null then
        return false;
    end if;

    select
        result.status::int
        into status
        from extensions.http((
            'POST',
            project_url || '/functions/v1/onesignal-notify',
            array[
                extensions.http_header('Authorization','Bearer ' || service_role_key)
            ],
            array[
                extensions.http_header('Content-Type','application/json')
            ],
            jsonb_build_object(
                'user_id', user_id,
                'contents', contents))::extensions.http_request) as result;
    if status <> 200 then
        return false;
    end if;

    return true;
end;
$$ language plpgsql security definer;
