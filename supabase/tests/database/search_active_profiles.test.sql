begin;

select
    plan (4);

select
    has_function (
        'public',
        'search_active_profiles',
        'search_active_profiles function should exist'
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
        '{"username": "First"}'
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
        '{"username": "Fourth"}'
    );

-- First User lives in Chicago
update public.profiles
set
    lnglat = point(87.6298, 41.8781)
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
    intention = array[
        'unsure'::intention_type,
        'serious'::intention_type,
        'marriage'::intention_type,
        'friends'::intention_type
    ],
    relationship = array[
        'unsure'::relationship_type,
        'monog'::relationship_type
    ],
    diet = array[
        'omnivore'::diet_type,
        'pescatarian'::diet_type,
        'vegetarian'::diet_type,
        'kosher'::diet_type,
        'halal'::diet_type,
        'gluten'::diet_type,
        'other'::diet_type
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
    intention = 'serious'::intention_type,
    relationship = 'monog'::relationship_type,
    diet = 'omnivore'::diet_type,
    lnglat = point(74.0060, 40.7128),
    about = 'I like long walks on the beach.'
where
    id = '22222222-2222-2222-2222-222222222222';

-- Third User lives in San Francisco
update public.profiles
set
    gender = 'female'::gender_type,
    kids = 'more'::kids_type,
    intention = 'casual'::intention_type,
    relationship = 'enm'::relationship_type,
    diet = 'vegan'::diet_type,
    lnglat = point(122.4194, 37.7749),
    about = 'I like long hikes in the mountains.'
where
    id = '33333333-3333-3333-3333-333333333333';

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- First User is only compatible with Second User (Third User only satisfies min_age)
select
    results_eq (
        'select (profile).id, score from public.search_active_profiles()',
        $$values ('22222222-2222-2222-2222-222222222222'::uuid, 10::float),
                 ('33333333-3333-3333-3333-333333333333'::uuid, 2::float),
                 ('44444444-4444-4444-4444-444444444444'::uuid, 1::float)$$
    );

-- If hide_preferences, First User only sees Second User (who is compatible with all preferences)
select
    results_eq (
        'select (profile).id, score from public.search_active_profiles(false, true)',
        $$values ('22222222-2222-2222-2222-222222222222'::uuid, 10::float)$$
    );

-- First User likes Third User and blocks Fourth User
insert into public.interactions (user_id, target_id, interaction)
values
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'like'),
    ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'block');

-- If hide_interactions, First User only sees Second User
select
    results_eq (
        'select (profile).id, score from public.search_active_profiles(true, false)',
        $$values ('22222222-2222-2222-2222-222222222222'::uuid, 10::float)$$
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
