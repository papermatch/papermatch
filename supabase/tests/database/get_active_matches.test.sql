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
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

-- Insert match between First User and Second User
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

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- Check that active match is now visible for First User
select
    results_eq (
        'select count(*) from public.get_active_matches()',
        $$values (1::bigint)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

-- Check that active match is now visible for Second User
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
