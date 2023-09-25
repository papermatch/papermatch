begin;

select
    plan (3);

select
    policies_are (
        'public',
        'matches',
        array['Users can view own matches.']
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

insert into
    public.matches (user1_id, user2_id)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
    );

-- Authenticate as Test User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- Users can view own matches
select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' or user2_id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

-- Authenticate as Other User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

select
    results_eq (
        'select count(*) from public.matches where user1_id = ''22222222-2222-2222-2222-222222222222'' or user2_id = ''22222222-2222-2222-2222-222222222222''',
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
