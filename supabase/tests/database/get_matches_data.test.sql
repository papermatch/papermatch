begin;

select
    plan (4);

select
    has_function (
        'public',
        'get_matches_data',
        'get_matches_data function should exist'
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222'),
    ('33333333-3333-3333-3333-333333333333');

-- Create match between First and Second Users
insert into
    public.matches (user1_id, user2_id)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
    );

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

select
    results_eq (
        'select count(*) from public.get_matches_data()',
        $$values (1::bigint)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

select
    results_eq (
        'select count(*) from public.get_matches_data()',
        $$values (1::bigint)$$
    );

-- Authenticate as Third User
set
    local "request.jwt.claims" to '{"sub": "33333333-3333-3333-3333-333333333333" }';

select
    results_eq (
        'select count(*) from public.get_matches_data()',
        $$values (0::bigint)$$
    );

-- Cleanup
reset role;

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
