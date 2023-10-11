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
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

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

-- First User can view own matches
select
    results_eq (
        'select count(*) from public.matches where user1_id = ''11111111-1111-1111-1111-111111111111'' or user2_id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

-- Second User can view own matches
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
