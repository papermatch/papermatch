begin;

select
    plan (6);

select
    has_function (
        'public',
        'set_message_read',
        'set_message_read function should exist'
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222'),
    ('33333333-3333-3333-3333-333333333333');

-- Create match between First and Second Users
insert into
    public.matches (user1_id, user2_id)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
    );

-- Insert message from First to Second User
insert into
    public.messages (match_id, user_id, message)
values
    (
        (
            select
                id
            from
                public.matches
            where
                user1_id = '11111111-1111-1111-1111-111111111111' and
                user2_id = '22222222-2222-2222-2222-222222222222'
        ),
        '11111111-1111-1111-1111-111111111111',
        'Hello, World!'
    );

select
    results_eq (
        'select is_read from public.messages where user_id = ''11111111-1111-1111-1111-111111111111''',
        $$values (false::boolean)$$
    );

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- First User wrote message, but can't set is_read to true
select
    results_eq (
        'select * from public.set_message_read (
            (
                select
                    id
                from
                    public.messages
                where
                    user_id = ''11111111-1111-1111-1111-111111111111''
            )
        )',
        $$values (false::boolean)$$
    );

-- Authenticate as Third User
set
    local "request.jwt.claims" to '{"sub": "33333333-3333-3333-3333-333333333333" }';

-- Third User is not in the match, so can't set is_read to true
select
    results_eq (
        'select * from public.set_message_read (
        (
            select
                id
            from
                public.messages
            where
                user_id = ''11111111-1111-1111-1111-111111111111''
        )
    )',
        $$values (false::boolean)$$
    );

-- Authenticate as Second User
set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

-- Second User can set is_read to true...
select
    results_eq (
        'select * from public.set_message_read (
        (
            select
                id
            from
                public.messages
            where
                user_id = ''11111111-1111-1111-1111-111111111111''
        )
    )',
        $$values (true::boolean)$$
    );

-- But only once!
select
    results_eq (
        'select * from public.set_message_read (
        (
            select
                id
            from
                public.messages
            where
                user_id = ''11111111-1111-1111-1111-111111111111''
        )
    )',
        $$values (false::boolean)$$
    );

-- Cleanup
reset role;

delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

delete from auth.users
where
    id = '22222222-2222-2222-2222-222222222222';

delete from auth.users
where
    id = '33333333-3333-3333-3333-333333333333';

select
    *
from
    finish ();

rollback;
