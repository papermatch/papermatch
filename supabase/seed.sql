insert into
    auth.users (id, created_at, updated_at)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '2023-09-01 12:00:00',
        '2023-09-10 12:00:00'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '2023-09-01 12:00:00',
        '2023-09-10 12:00:00'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '2023-09-01 12:00:00',
        '2023-09-10 12:00:00'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '2023-09-01 12:00:00',
        '2023-09-10 12:00:00'
    );

update profiles
set
    updated_at = '2023-09-10 12:00:00',
    username = 'Alice',
    full_name = 'Alice Johnson',
    avatar_url = 'https://example.com/avatar1.png',
    website = 'https://example.com/user1'
where
    id = '11111111-1111-1111-1111-111111111111';

update profiles
set
    updated_at = '2023-09-10 12:00:00',
    username = 'Bob',
    full_name = 'Bob Smith',
    avatar_url = 'https://example.com/avatar2.png',
    website = 'https://example.com/user2'
where
    id = '22222222-2222-2222-2222-222222222222';

update profiles
set
    updated_at = '2023-09-10 12:00:00',
    username = 'Charlie',
    full_name = 'Charlie Davis',
    avatar_url = 'https://example.com/avatar3.png',
    website = 'https://example.com/user3'
where
    id = '33333333-3333-3333-3333-333333333333';

update profiles
set
    updated_at = '2023-09-10 12:00:00',
    username = 'Dana',
    full_name = 'Dana Lee',
    avatar_url = 'https://example.com/avatar4.png',
    website = 'https://example.com/user4'
where
    id = '44444444-4444-4444-4444-444444444444';

insert into
    credits (
        user_id,
        creditor,
        creditor_id,
        credits,
        created_at
    )
values
    (
        '11111111-1111-1111-1111-111111111111',
        'stripe',
        'creditor_id1',
        10,
        '2023-09-10 12:00:00'
    );

insert into
    interactions (user_id, target_id, interaction, updated_at)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'like',
        '2023-09-10 12:00:00'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'like',
        '2023-09-10 12:01:00'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        'block',
        '2023-09-10 12:02:00'
    );
