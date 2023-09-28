begin;

select
    plan (4);

select
    has_function (
        'public',
        'get_active_matches',
        'get_active_matches function should exist'
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

-- Insert match between Test User and Other User
insert into
    matches (user1_id, user2_id)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
    );

-- Check that "unauthenticated" call returns no matches
select
    results_eq (
        'select count(*) from public.get_active_matches()',
        $$values (0::bigint)$$
    );

-- Authenticate as Test User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- Check that active match is now visible for Test User
select
    results_eq (
        'select count(*) from public.get_active_matches()',
        $$values (1::bigint)$$
    );

-- Authenticate as Other User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

-- Check that active match is now visible for Other User
select
    results_eq (
        'select count(*) from public.get_active_matches()',
        $$values (1::bigint)$$
    );

-- Cleanup
reset role;

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
