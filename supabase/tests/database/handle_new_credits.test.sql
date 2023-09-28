begin;

select
    plan (5);

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
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '{"full_name": "Third User", "avatar_url": ""}'
    );

-- Test User and Other User like each other, results in an active match
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

-- Test User and Third User like each other, does not result in match because Test User has no remaining credits
insert into
    interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'like'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'like'
    );

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' and user2_id = ''33333333-3333-3333-3333-333333333333''',
        $$values (0::bigint)$$
    );

-- Test User adds credits, pending match with Third User is automatically created
insert into
    credits (user_id, creditor, creditor_id, credits)
values
    (
        '11111111-1111-1111-1111-111111111111',
        'stripe',
        'cs_test',
        1
    );

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' and user2_id = ''33333333-3333-3333-3333-333333333333'' and active = true',
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
