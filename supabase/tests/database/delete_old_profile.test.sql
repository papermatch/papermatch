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

insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"full_name": "Test User", "avatar_url": ""}'
    );

select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (0::bigint)$$
    );

select
    *
from
    finish ();

rollback;
