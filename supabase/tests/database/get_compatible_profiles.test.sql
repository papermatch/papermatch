begin;

select
    plan (2);

select
    has_function (
        'public',
        'get_compatible_profiles',
        'get_compatible_profiles function should exist'
    );

-- Setup
create schema test;

create function test.current_date_override () returns date as $$
begin
    return '2020-01-01'::date;
end;
$$ language plpgsql security definer;

set
    search_path to test,
    public,
    extensions;

insert into
    auth.users (id, raw_user_meta_data)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '{"username": "First", "birthday": "1990-01-01"}'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '{"username": "Second", "birthday": "1990-01-01"}'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '{"username": "Third", "birthday": "1980-01-01"}'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '{"username": "Fourth", "birthday": "1990-01-01"}'
    );

-- First User lives in Chicago
update public.profiles
set
    gender = 'nonbinary'::gender_type,
    kids = 'unsure'::kids_type,
    lnglat = point(87.6298, 41.8781),
    about = 'I like long swims in the ocean.'
where
    id = '11111111-1111-1111-1111-111111111111';

update public.preferences
set
    min_age = 25,
    max_age = 35,
    gender = array['male'::gender_type, 'nonbinary'::gender_type],
    kids = array[
        'none'::kids_type,
        'unsure'::kids_type,
        'want'::kids_type,
        'have'::kids_type
    ],
    radius = 1000,
    keywords = array['beach']
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second User lives in New York
update public.profiles
set
    gender = 'male'::gender_type,
    kids = 'none'::kids_type,
    lnglat = point(74.0060, 40.7128),
    about = 'I like long walks on the beach.'
where
    id = '22222222-2222-2222-2222-222222222222';

-- Third User lives in San Francisco
update public.profiles
set
    gender = 'female'::gender_type,
    kids = 'more'::kids_type,
    lnglat = point(122.4194, 37.7749),
    about = 'I like long hikes in the mountains.'
where
    id = '33333333-3333-3333-3333-333333333333';

-- Fourth User lives in Chicago
update public.profiles
set
    gender = 'male'::gender_type,
    kids = 'have'::kids_type,
    lnglat = point(87.6298, 41.8781),
    about = 'I like long walks on the beach.'
where
    id = '44444444-4444-4444-4444-444444444444';

update public.preferences
set
    gender = array['female'::gender_type]
where
    id = '44444444-4444-4444-4444-444444444444';

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- First User is only compatible with Second User because of Fourth User's preferences
select
    results_eq (
        'select id from public.get_compatible_profiles()',
        $$values ('22222222-2222-2222-2222-222222222222'::uuid)$$
    );

-- Cleanup
reset role;

drop function test.current_date_override ();

drop schema test cascade;

set
    search_path to public,
    extensions;

delete from auth.users
where
    id = '11111111-1111-1111-1111-111111111111';

delete from auth.users
where
    id = '22222222-2222-2222-2222-222222222222';

delete from auth.users
where
    id = '33333333-3333-3333-3333-333333333333';

delete from auth.users
where
    id = '44444444-4444-4444-4444-444444444444';

select
    *
from
    finish ();

rollback;
