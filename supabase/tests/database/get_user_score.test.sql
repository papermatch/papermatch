begin;

select
    plan (40);

select
    has_function (
        'public',
        'get_user_score',
        'get_user_score function should exist'
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
    gender = 'female'::gender_type,
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

-- All users are initially null because First User's settings are null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (null::float)$$
    );

select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (null::float)$$
    );

select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (null::float)$$
    );

update public.preferences
set
    min_age = 35
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now incompatible because they are too young
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (1::float)$$
    );

-- Third user is still compatible because they are old enough
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (10::float)$$
    );

-- Fourth user is still incompatible because they don't have a birthday
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    min_age = null,
    max_age = 35
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because they are young enough
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user now incompatible because they are too old
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because they don't have a birthday
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    max_age = null,
    gender = array['male'::gender_type, 'nonbinary'::gender_type]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their gender matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their gender does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their gender is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    gender = null,
    education = array[
        'high'::education_type,
        'undergrad'::education_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their education matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their education does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their education is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    education = null,
    religion = array[
        'agnostic'::religion_type,
        'atheist'::religion_type,
        'buddhist'::religion_type,
        'christian'::religion_type,
        'hindu'::religion_type,
        'jewish'::religion_type,
        'muslim'::religion_type,
        'other'::religion_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their religion matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their religion does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their religion is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    religion = null,
    sexuality = array[
        'straight'::sexuality_type,
        'gay'::sexuality_type,
        'lesbian'::sexuality_type,
        'bi'::sexuality_type,
        'pan'::sexuality_type,
        'ace'::sexuality_type,
        'other'::sexuality_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their sexuality matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their sexuality does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their sexuality is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    gender = null,
    family = array[
        'none'::family_type,
        'unsure'::family_type,
        'want'::family_type,
        'have'::family_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their family matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their family does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their family is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    family = null,
    intention = array[
        'unsure'::intention_type,
        'serious'::intention_type,
        'marriage'::intention_type,
        'friends'::intention_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their intention matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their intention does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their intention is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    intention = null,
    relationship = array[
        'unsure'::relationship_type,
        'monog'::relationship_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their relationship matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their relationship does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their relationship is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    relationship = null,
    diet = array[
        'omnivore'::diet_type,
        'pescatarian'::diet_type,
        'vegetarian'::diet_type,
        'kosher'::diet_type,
        'halal'::diet_type,
        'gluten'::diet_type,
        'other'::diet_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their diet matches
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because their diet does not match
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their diet is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    diet = null,
    radius = 1000
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because they are within radius
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because they are outside radius
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their lnglat is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
    );

update public.preferences
set
    radius = null,
    keywords = array['beach']
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because they mention 'beach'
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (10::float)$$
    );

-- Third user is now incompatible because they don't mention 'beach'
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (1::float)$$
    );

-- Fourth user is still incompatible because their about is null
select
    results_eq (
        'select public.get_user_score(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (1::float)$$
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
