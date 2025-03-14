begin;

select
    plan (5);

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
    ('22222222-2222-2222-2222-222222222222'),
    ('33333333-3333-3333-3333-333333333333');

-- Add some matches
insert into
    public.matches (user1_id, user2_id)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333'
    );

-- Add a message to each match
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
        'Hello, Second!'
    ),
    (
        (
            select
                id
            from
                public.matches
            where
                user1_id = '11111111-1111-1111-1111-111111111111' and
                user2_id = '33333333-3333-3333-3333-333333333333'
        ),
        '33333333-3333-3333-3333-333333333333',
        'Hello, First!'
    );

-- Deactivate the latter match
update public.matches
set
    active = false
where
    id = (
        select
            id
        from
            public.matches
        where
            user1_id = '11111111-1111-1111-1111-111111111111' and
            user2_id = '33333333-3333-3333-3333-333333333333'
    );

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- Users can view messages from their active matches
select
    results_eq (
        'select message from public.messages',
        $$values ('Hello, Second!')$$
    );

-- Users can add messages to their active matches
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
        'How are you?'
    );

select
    results_eq (
        'select message from public.messages',
        $$values ('Hello, Second!'), ('How are you?')$$
    );

-- Users can't add messages to their inactive matches
select
    throws_ok (
        $$
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
                    user2_id = '33333333-3333-3333-3333-333333333333'
            ),
            '11111111-1111-1111-1111-111111111111',
            'How are you?'
        );
    $$,
        '42501'
    );

-- Users can delete their own messages
delete from public.messages
where
    message = 'How are you?';

select
    results_eq (
        'select message from public.messages',
        $$values ('Hello, Second!')$$
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
