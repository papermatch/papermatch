alter table profiles
drop constraint profiles_username_key;

create function public.send_onesignal_notify (user_id uuid, contents text) returns boolean as $$
declare
    project_url text;
    status int;
begin
    select decrypted_secret
        into project_url
        from vault.decrypted_secrets
        where name = 'SUPABASE_URL';
    if project_url is null then
        return false;
    end if;

    select
        result.status::int
        into status
        from extensions.http((
            'POST',
            project_url || '/functions/v1/onesignal-notify',
            null,
            array[extensions.http_header('Content-Type','application/json')],
            jsonb_build_object(
                'user_id', user_id,
                'contents', contents))::extensions.http_request) as result;
    if status <> 200 then
        return false;
    end if;

    return true;
end;
$$ language plpgsql security definer;

create or
replace function handle_new_match () returns trigger as $$
declare
    p1 profiles%rowtype;
    p2 profiles%rowtype;
begin
    insert into credits (user_id, creditor, creditor_id, credits)
    values
        (new.user1_id, 'match', new.id::varchar, -1),
        (new.user2_id, 'match', new.id::varchar, -1);

    select * into p1 from profiles where id = new.user1_id;
    select * into p2 from profiles where id = new.user2_id;

    perform public.send_onesignal_notify(new.user1_id, 'You matched with ' || p2.username || '!');
    perform public.send_onesignal_notify(new.user2_id, 'You matched with ' || p1.username || '!');

    return new;
end;
$$ language plpgsql security definer;

create function handle_new_message () returns trigger as $$
declare
    m matches%rowtype;
    p profiles%rowtype;
begin
    select *
        into m
        from matches
        where id = new.match_id;

    select *
        into p
        from profiles
        where id = new.user_id;

    if m.user1_id = new.user_id then
        perform public.send_onesignal_notify(m.user2_id, p.username || ' sent you a message!');
    else
        perform public.send_onesignal_notify(m.user1_id, p.username || ' sent you a message!');
    end if;

    return new;
end;
$$ language plpgsql security definer;

create trigger after_message_created
after insert on messages for each row
execute procedure handle_new_message ();
