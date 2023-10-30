begin;

select
    plan (6);

select
    has_function (
        'public',
        'refresh_active_view',
        'refresh_active_view function should exist'
    );

select
    has_trigger (
        'public',
        'credits',
        'refresh_active_view',
        'refresh_active_view trigger should exist'
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

-- Profiles created with initial credits when users created
select
    results_eq (
        'select count(*) from public.active',
        $$values (2::bigint)$$
    );

-- First User spends initial credit
insert into
    public.credits (user_id, creditor, creditor_id, credits)
values
    (
        '11111111-1111-1111-1111-111111111111',
        'match',
        'match_id',
        -1
    );

-- First User has no more credits and is no longer active
select
    results_eq (
        'select count(*) from public.active',
        $$values (1::bigint)$$
    );

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- First User can still see Second User is active
select
    results_eq (
        'select count(*) from public.active',
        $$values (1::bigint)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

-- Second User can see that they are active
select
    results_eq (
        'select count(*) from public.active',
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
