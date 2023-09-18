begin;

select
    plan (3);

select
    policies_are (
        'public',
        'credits',
        array['User can see own credits.']
    );

--- Setup
insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"full_name": "Test User", "avatar_url": ""}'
    );

insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '22222222-2222-2222-2222-222222222222',
        '{"full_name": "Other User", "avatar_url": ""}'
    );

--- All credits visible when not authenticated
select
    results_eq (
        'select count(*) from public.credits where user_id in (''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (2::bigint)$$
    );

--- Authenticate as Other User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

set role 'authenticated';

--- Only Other User's credits visible when authenticated
select
    results_eq (
        'select count(*) from public.credits where user_id in (''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (1::bigint)$$
    );

--- Cleanup
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
