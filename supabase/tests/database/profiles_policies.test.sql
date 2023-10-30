begin;

select
    plan (5);

select
    policies_are (
        'public',
        'profiles',
        array[
            'Public profiles are viewable by everyone.',
            'Users can insert their own profile.',
            'Users can update own profile.',
            'Non-blocked-by profiles are viewable.',
            'Public profiles are viewable by everyone.',
            'Test user is only viewable by test user.'
        ]
    );

-- Setup
insert into
    auth.users (id)
values
    ('00000000-0000-0000-0000-000000000000'),
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

-- Set TEST_USER_ID (First and Second User won't see Test User)
select
    vault.create_secret (
        '00000000-0000-0000-0000-000000000000',
        'TEST_USER_ID'
    );

-- First User blocks Second User
insert into
    public.interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'block'
    );

-- All non-test profiles visible when not authenticated
select
    results_eq (
        'select count(*) from public.profiles',
        $$values (3::bigint)$$
    );

-- Authenticate as Test User
set
    local "request.jwt.claims" to '{"sub": "00000000-0000-0000-0000-000000000000" }';

set role 'authenticated';

-- Test User can see all profiles
select
    results_eq (
        'select count(*) from public.profiles',
        $$values (3::bigint)$$
    );

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

-- First User can see own and Second User's profile
select
    results_eq (
        'select count(*) from public.profiles',
        $$values (2::bigint)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

-- Second User is blocked and can't see First User's profile
select
    results_eq (
        'select count(*) from public.profiles',
        $$values (1::bigint)$$
    );

-- Cleanup
reset role;

delete from auth.Users
where
    id = '00000000-0000-0000-0000-000000000000';

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
