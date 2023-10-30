begin;

select
    plan (3);

select
    has_function (
        'public',
        'set_test_otp',
        'set_test_otp function should exist'
    );

select
    has_trigger (
        'auth',
        'users',
        'set_test_otp',
        'set_test_otp trigger should exist'
    );

-- Setup
select
    vault.create_secret (
        '00000000-0000-0000-0000-000000000000',
        'TEST_USER_ID'
    );

insert into
    auth.users (id, email)
values
    (
        '00000000-0000-0000-0000-000000000000',
        'test@example.com'
    );

select
    results_eq (
        'select recovery_token from auth.users where id = ''00000000-0000-0000-0000-000000000000''',
        $$values ('a3f3debf8d4c206eac18c518ad464512d0033123760f8a2c42a1110c'::varchar)$$
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
