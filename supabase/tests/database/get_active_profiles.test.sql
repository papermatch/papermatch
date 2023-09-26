begin;

select
    plan (4);

select
    has_function (
        'public',
        'get_active_profiles',
        'get_active_profiles function should exist'
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

-- Profiles created with initial credits when users created
select
    results_eq (
        'select count(*) from public.get_active_profiles()',
        $$values (2::bigint)$$
    );

-- Test User spends initial credit
insert into
    public.credits (user_id, creditor, creditor_id, credits)
values
    (
        '11111111-1111-1111-1111-111111111111',
        'match',
        'match_id',
        -1
    );

-- Test User has no more credits and is no longer active
select
    results_eq (
        'select count(*) from public.get_active_profiles()',
        $$values (1::bigint)$$
    );

-- Authenticate as Test User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- Test User can still see Other User
select
    results_eq (
        'select count(*) from public.get_active_profiles()',
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
