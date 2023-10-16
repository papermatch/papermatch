begin;

select
    plan (8);

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
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222'),
    ('33333333-3333-3333-3333-333333333333'),
    ('44444444-4444-4444-4444-444444444444');

-- All users should have initial credits
select
    results_eq (
        'select user_id, credits from public.credits where user_id in (''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'', ''33333333-3333-3333-3333-333333333333'', ''44444444-4444-4444-4444-444444444444'') order by user_id',
        $$values ('11111111-1111-1111-1111-111111111111'::uuid, 1), ('22222222-2222-2222-2222-222222222222'::uuid, 1), ('33333333-3333-3333-3333-333333333333'::uuid, 1), ('44444444-4444-4444-4444-444444444444'::uuid, 1)$$
    );

-- Second User first likes First User should not result in a match
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

-- New mutual likes between First User and Third User should not result in match due to insufficient credits
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

insert into
    credits (user_id, creditor, creditor_id, credits)
values
    (
        '11111111-1111-1111-1111-111111111111',
        'stripe',
        'cs_test',
        1
    );

-- First user liking Fourth User should not result in a match
insert into
    interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444444',
        'like'
    );

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' and user2_id = ''44444444-4444-4444-4444-444444444444''',
        $$values (0::bigint)$$
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
