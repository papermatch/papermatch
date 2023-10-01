begin;

select
    plan (3);

select
    policies_are (
        'public',
        'profiles',
        array[
            'Users can insert their own profile.',
            'Users can update own profile.',
            'Non-blocked-by profiles are viewable.'
        ]
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

-- First User blocks Second User
insert into
    public.interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'block'
    );

-- All profiles visible when not authenticated
select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

set role 'authenticated';

-- Second User is blocked and can't see First User's profile
select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
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

select
    *
from
    finish ();

rollback;
