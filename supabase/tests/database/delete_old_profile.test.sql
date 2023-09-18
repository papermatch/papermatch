begin;

select
    plan (4);

select
    has_function (
        'public',
        'delete_old_profile',
        'delete_old_profile function should exist'
    );

select
    has_trigger (
        'auth',
        'users',
        'before_delete_user',
        'before_delete_user trigger should exist'
    );

--- Setup
insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"full_name": "Test User", "avatar_url": ""}'
    );

--- Profile created when user created
select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

--- Delete user
delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

--- Profile deleted when user deleted
select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (0::bigint)$$
    );

--- Cleanup
select
    *
from
    finish ();

rollback;
