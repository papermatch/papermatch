begin;

select
    plan (3);

select
    has_function (
        'public',
        'delete_current_user',
        'delete_current_user function should exist'
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111');

-- Profile created when user created
select
    results_eq (
        'select count(*) from auth.users where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- Delete user
select public.delete_current_user ();

reset role;

-- Profile deleted when user deleted
select
    results_eq (
        'select count(*) from auth.users where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (0::bigint)$$
    );

-- Cleanup
select
    *
from
    finish ();

rollback;
