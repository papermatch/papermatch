begin;

select
    plan (4);

select
    has_function (
        'public',
        'handle_new_user',
        'handle_new_user function should exist'
    );

select
    has_trigger (
        'auth',
        'users',
        'on_auth_user_created',
        'on_auth_user_created trigger should exist'
    );

--- Setup
insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"full_name": "Test User", "avatar_url": ""}'
    );

--- Check that profile created
select
    results_eq (
        'select id, full_name, avatar_url from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values ('11111111-1111-1111-1111-111111111111'::uuid, 'Test User', '')$$
    );

--- Check for initial credit
select
    results_eq (
        'select user_id, creditor, credits from public.credits where user_id = ''11111111-1111-1111-1111-111111111111''',
        $$values ('11111111-1111-1111-1111-111111111111'::uuid, 'init'::creditor_type, 1)$$
    );

--- Cleanup
delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

select
    *
from
    finish ();

rollback;
