begin;

select
    plan (3);

select
    has_function (
        'public',
        'get_active_profiles',
        'get_active_profiles function should exist'
    );

--- Setup
insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"full_name": "Test User", "avatar_url": ""}'
    );

--- Profile created with initial credit when user created
select
    results_eq (
        'select count(*) from public.get_active_profiles() where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

--- Spend initial credit
insert into
    public.credits (user_id, creditor, creditor_id, credits)
values
    (
        '11111111-1111-1111-1111-111111111111',
        'match',
        'match_id',
        -1
    );

--- User has no more credits and is no longer active
select
    results_eq (
        'select count(*) from public.get_active_profiles() where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (0::bigint)$$
    );

--- Cleanup
delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

select
    *
from
    finish ();

rollback;
