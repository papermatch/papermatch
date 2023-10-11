begin;

select
    plan (6);

select
    policies_are (
        'public',
        'interactions',
        array[
            'User can see own interactions.',
            'User can add own interactions (but not with themselves).',
            'Users can update own interactions.'
        ]
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

insert into
    public.interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'block'
    );

-- All interactions visible when not authenticated
select
    results_eq (
        'select count(*) from public.interactions',
        $$values (1::bigint)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

set role 'authenticated';

-- Only Second User's interactions visible when authenticated
select
    results_eq (
        'select count(*) from public.interactions',
        $$values (0::bigint)$$
    );

insert into
    public.interactions (user_id, target_id, interaction)
values
    (
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'block'
    );

select
    results_eq (
        'select count(*) from public.interactions',
        $$values (1::bigint)$$
    );

-- Inserting an interaction with self should fail
select
    throws_ok (
        $$
    insert into
        public.interactions (user_id, target_id, interaction)
    values
        (
            '22222222-2222-2222-2222-222222222222',
            '22222222-2222-2222-2222-222222222222',
            'block'
        );
    $$,
        '42501'
    );

-- Users can update own interactions
update public.interactions
set
    interaction = 'like'
where
    user_id = '22222222-2222-2222-2222-222222222222' and
    target_id = '11111111-1111-1111-1111-111111111111';

select
    results_eq (
        'select interaction from public.interactions',
        $$values ('like'::public.interaction_type)$$
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
