begin;

select
    plan (6);

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
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

-- Both users should have initial credits
select
    results_eq (
        'select sum(credits) from public.credits where user_id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

select
    results_eq (
        'select sum(credits) from public.credits where user_id = ''22222222-2222-2222-2222-222222222222''',
        $$values (1::bigint)$$
    );

-- Insert new match between First User and Second User
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
        'select sum(credits) from public.credits where user_id = ''11111111-1111-1111-1111-111111111111''',
        $$values (0::bigint)$$
    );

select
    results_eq (
        'select sum(credits) from public.credits where user_id = ''22222222-2222-2222-2222-222222222222''',
        $$values (0::bigint)$$
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
