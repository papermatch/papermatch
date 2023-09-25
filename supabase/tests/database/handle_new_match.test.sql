begin;

select
    plan (4);

select
    has_function (
        'public',
        'handle_new_match',
        'handle_new_match function should exist'
    );

select
    has_trigger (
        'public',
        'matches',
        'after_match_created',
        'after_match_created trigger should exist'
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

-- Both users should have initial credits
select
    results_eq (
        'select user_id, sum(credits) from public.credits where user_id in (''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'') group by user_id',
        $$values ('22222222-2222-2222-2222-222222222222'::uuid, 1::bigint), ('11111111-1111-1111-1111-111111111111'::uuid, 1::bigint)$$
    );

-- Insert new match between Test User and Other User
insert into
    matches (user1_id, user2_id)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
    );

-- Both users should now have 0 credits
select
    results_eq (
        'select user_id, sum(credits) from public.credits where user_id in (''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'') group by user_id',
        $$values ('22222222-2222-2222-2222-222222222222'::uuid, 0::bigint), ('11111111-1111-1111-1111-111111111111'::uuid, 0::bigint)$$
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
