begin;

select
    plan (22);

select
    has_function (
        'public',
        'is_profile_compatible',
        'is_profile_compatible function should exist'
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

-- Authenticate as First User
set
    local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

set role 'authenticated';

-- All users are initially compatible because First User's settings are null
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (true::boolean)$$
    );

select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (true::boolean)$$
    );

select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (true::boolean)$$
    );

update public.settings
set
    min_age = 35
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now incompatible because they are too young
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (false::boolean)$$
    );

-- Third user is still compatible because they are old enough
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (true::boolean)$$
    );

-- Fourth user is still incompatible because they don't have a birthday
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (false::boolean)$$
    );

update public.settings
set
    min_age = null,
    max_age = 35
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because they are young enough
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (true::boolean)$$
    );

-- Third user now incompatible because they are too old
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (false::boolean)$$
    );

-- Fourth user is still incompatible because they don't have a birthday
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (false::boolean)$$
    );

update public.settings
set
    max_age = null,
    gender = array['male'::gender_type, 'nonbinary'::gender_type]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their gender matches
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (true::boolean)$$
    );

-- Third user is now incompatible because their gender does not match
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (false::boolean)$$
    );

-- Fourth user is still incompatible because their gender is null
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (false::boolean)$$
    );

update public.settings
set
    gender = null,
    kids = array[
        'none'::kids_type,
        'unsure'::kids_type,
        'want'::kids_type,
        'have'::kids_type
    ]
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because their kids matches
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (true::boolean)$$
    );

-- Third user is now incompatible because their kids does not match
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (false::boolean)$$
    );

-- Fourth user is still incompatible because their kids is null
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (false::boolean)$$
    );

update public.settings
set
    kids = null,
    radius = 1000
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because they are within radius
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (true::boolean)$$
    );

-- Third user is now incompatible because they are outside radius
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (false::boolean)$$
    );

-- Fourth user is still incompatible because their lnglat is null
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (false::boolean)$$
    );

update public.settings
set
    radius = null,
    keywords = array['beach']
where
    id = '11111111-1111-1111-1111-111111111111';

-- Second user is now compatible because they mention 'beach'
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (true::boolean)$$
    );

-- Third user is now incompatible because they don't mention 'beach'
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'')',
        $$values (false::boolean)$$
    );

-- Fourth user is still incompatible because their about is null
select
    results_eq (
        'select public.is_profile_compatible(''11111111-1111-1111-1111-111111111111'', ''44444444-4444-4444-4444-444444444444'')',
        $$values (false::boolean)$$
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

rollback;
