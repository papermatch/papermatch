begin;

select
    plan (5);

select
    has_function (
        'public',
        'get_users_score',
        'get_users_score function should exist'
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
    max_age = 45,
    gender = array['male'::gender_type, 'nonbinary'::gender_type],
    education = array[
        'high'::education_type,
        'undergrad'::education_type
    ],
    religion = array[
        'agnostic'::religion_type,
        'atheist'::religion_type,
        'buddhist'::religion_type,
        'christian'::religion_type,
        'hindu'::religion_type,
        'jewish'::religion_type,
        'muslim'::religion_type,
        'other'::religion_type
    ],
    sexuality = array[
        'straight'::sexuality_type,
        'gay'::sexuality_type,
        'lesbian'::sexuality_type,
        'bi'::sexuality_type,
        'pan'::sexuality_type,
        'ace'::sexuality_type,
        'other'::sexuality_type
    ],
    family = array[
        'none'::family_type,
        'unsure'::family_type,
        'want'::family_type,
        'have'::family_type
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
    radius = 5000,
    keywords = array['beach']
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second User lives in New York
update public.profiles
set
    gender = 'male'::gender_type,
    education = 'undergrad'::education_type,
    religion = 'agnostic'::religion_type,
    sexuality = 'straight'::sexuality_type,
    family = 'none'::family_type,
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
    gender = 'nonbinary'::gender_type,
    education = 'postgrad'::education_type,
    religion = 'catholic'::religion_type,
    sexuality = 'demi'::sexuality_type,
    family = 'more'::family_type,
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

select
    results_eq (
        'select * from public.get_users_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

select
    results_eq (
        'select * from public.get_users_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (4::float)$$
    );

select
    results_eq (
        'select * from public.get_users_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (0::float)$$
    );

-- Second User doesn't have any preferences set
select
    results_eq (
        'select * from public.get_users_score(''22222222-2222-2222-2222-222222222222'', ''11111111-1111-1111-1111-111111111111'')',
        $$values (null::float)$$
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
