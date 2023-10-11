begin;

select
    plan (5);

select
    policies_are (
        'public',
        'preferences',
        array[
            'Users can see own preferences.',
            'Users can update own preferences.'
        ]
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

set role 'authenticated';

-- Second User can see their own preferences
select
    results_eq (
        'select count(*) from public.preferences where id = ''22222222-2222-2222-2222-222222222222''',
        $$values (1::bigint)$$
    );

-- Second User can't see First User's preferences
select
    results_eq (
        'select count(*) from public.preferences where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (0::bigint)$$
    );

-- Second User can update their own preferences
update public.preferences
set
    min_age = 18
where
    id = '22222222-2222-2222-2222-222222222222';

select
    results_eq (
        'select min_age from public.preferences where id = ''22222222-2222-2222-2222-222222222222''',
        $$values (18::int)$$
    );

-- Second User can't update First User's preferences
update public.preferences
set
    min_age = 18
where
    id = '11111111-1111-1111-1111-111111111111';

reset role;

select
    results_eq (
        'select min_age from public.preferences where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (null::int)$$
    );

-- Cleanup
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
