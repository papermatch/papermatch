begin;

select
    plan (4);

select
    has_function (
        'public',
        'handle_nonlike_interaction',
        'handle_nonlike_interaction function should exist'
    );

select
    has_trigger (
        'public',
        'interactions',
        'after_nonlike_interaction',
        'after_nonlike_interaction trigger should exist'
    );

-- Setup
insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"full_name": "Test User", "avatar_url": ""}'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '{"full_name": "Other User", "avatar_url": ""}'
    );

-- Users like each other, results in an active match
insert into
    interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'like'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'like'
    );

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' and user2_id = ''22222222-2222-2222-2222-222222222222'' and active = true',
        $$values (1::bigint)$$
    );

-- Test User passes on Other User, deactivates match
update interactions
set interaction = 'pass'
where
    user_id = '11111111-1111-1111-1111-111111111111' and
    target_id = '22222222-2222-2222-2222-222222222222';

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' and user2_id = ''22222222-2222-2222-2222-222222222222'' and active = false',
        $$values (1::bigint)$$
    );

-- Cleanup
delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

delete from auth.users
where
    id = '22222222-2222-2222-2222-222222222222';

select
    *
from
    finish ();

rollback;
