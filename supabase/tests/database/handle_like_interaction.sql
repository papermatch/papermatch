begin;

select
    plan (7);

select
    has_function (
        'public',
        'handle_like_interaction',
        'handle_like_interaction function should exist'
    );

select
    has_trigger (
        'public',
        'interactions',
        'after_like_interaction',
        'after_like_interaction trigger should exist'
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

-- All users should have initial credits
select
    results_eq (
        'select user_id, credits from public.credits where user_id in (''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'', ''33333333-3333-3333-3333-333333333333'')',
        $$values ('11111111-1111-1111-1111-111111111111'::uuid, 1), ('22222222-2222-2222-2222-222222222222'::uuid, 1), ('33333333-3333-3333-3333-333333333333'::uuid, 1)$$
    );

-- Other User first likes Test User should not result in a match
insert into
    interactions (user_id, target_id, interaction)
values
    (
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'like'
    );

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''22222222-2222-2222-2222-222222222222'' or user2_id = ''22222222-2222-2222-2222-222222222222''',
        $$values (0::bigint)$$
    );

-- Mutual likes should now result in an active match
insert into
    interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'like'
    );

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' and user2_id = ''22222222-2222-2222-2222-222222222222'' and active = true',
        $$values (1::bigint)$$
    );

-- New mutual likes between Test User and Third User should not result in match due to insufficient credits
insert into
    interactions (user_id, target_id, interaction)
values
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'like'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'like'
    );

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' and user2_id = ''33333333-3333-3333-3333-333333333333''',
        $$values (0::bigint)$$
    );

-- Inactive match between Second User and Third User should be reactivated by mutual likes (even though Second User has insufficient credits)
insert into
    matches (user1_id, user2_id, active)
values
    (
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        false
    );

insert into
    interactions (user_id, target_id, interaction)
values
    (
        '33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        'like'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'like'
    );

-- Verify that previously inactive match is now active
select
    results_eq (
        'select count(*) from public.matches where user1_id = ''22222222-2222-2222-2222-222222222222'' and user2_id = ''33333333-3333-3333-3333-333333333333'' and active = true',
        $$values (1::bigint)$$
    );

-- Cleanup
delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

delete from auth.users
where
    id = '22222222-2222-2222-2222-222222222222';

delete from auth.users
where
    id = '33333333-3333-3333-3333-333333333333';

select
    *
from
    finish ();

rollback;
