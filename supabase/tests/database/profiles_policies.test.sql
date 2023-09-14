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

insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"full_name": "Test User", "avatar_url": ""}'
    );

insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '22222222-2222-2222-2222-222222222222',
        '{"full_name": "Other User", "avatar_url": ""}'
    );

insert into
    public.interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'block'
    );

select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (1::bigint)$$
    );

set
    local "request.jwt.claims" to '{"sub": "22222222-2222-2222-2222-222222222222" }';

set role 'authenticated';

update public.profiles
set
    username = 'Other'
where
    id = '22222222-2222-2222-2222-222222222222';

select
    results_eq (
        'select count(*) from public.profiles where id = ''11111111-1111-1111-1111-111111111111''',
        $$values (0::bigint)$$
    );

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
