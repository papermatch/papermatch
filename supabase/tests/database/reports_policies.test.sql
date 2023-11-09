begin;

select
    plan (5);

select
    policies_are (
        'public',
        'reports',
        array[
            'Users can report as themselves.',
            'User can report other users (but not themselves).'
        ]
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- First User reports Second User
insert into
    public.reports (user_id, reporter_id, reason, details)
values
    (
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'fake',
        'This user is fake!'
    );

-- But can't report as Second User
select
    throws_ok (
        $$
    insert into
        public.reports (user_id, reporter_id, reason, details)
    values
        (
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
            'inappropriate',
            'This user is inappropriate!'
        );
    $$,
        '42501'
    );

-- And can't report themselves
select
    throws_ok (
        $$
    insert into
        public.reports (user_id, reporter_id, reason, details)
    values
        (
            '11111111-1111-1111-1111-111111111111',
            '11111111-1111-1111-1111-111111111111',
            'underage',
            'This user is underage!'
        );
    $$,
        '42501'
    );

-- Reports are not publicly visible
select
    results_eq (
        'select count(*) from public.reports',
        $$values (0::bigint)$$
    );

reset role;

-- But can be seen by admin
select
    results_eq (
        'select count(*) from public.reports',
        $$values (1::bigint)$$
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
