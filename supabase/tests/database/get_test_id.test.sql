begin;

select
    plan (3);

select
    has_function (
        'public',
        'get_test_id',
        'get_test_id function should exist'
    );

-- Setup
insert into
    auth.users (id)
values
    ('00000000-0000-0000-0000-000000000000');

-- TEST_USER_ID not initially set, should return null
select
    results_eq (
        'select public.get_test_id ()',
        $$values (null::uuid)$$
    );

-- Set TEST_USER_ID
select
    vault.create_secret (
        '00000000-0000-0000-0000-000000000000',
        'TEST_USER_ID'
    );

select
    results_eq (
        'select public.get_test_id ()',
        $$values ('00000000-0000-0000-0000-000000000000'::uuid)$$
    );

-- Cleanup
reset role;

delete from auth.users
where
    id = '00000000-0000-0000-0000-000000000000';

select
    *
from
    finish ();

rollback;
