begin;

select
    plan (1);

select
    has_function (
        'public',
        'get_compatible_profiles',
        'get_compatible_profiles function should exist'
    );

-- -- Setup
-- insert into
--     auth.users (id, raw_user_meta_data)
-- values
--     (
--         '11111111-1111-1111-1111-111111111111',
--         '{"username": "First", "birthday": "2001-01-01"}'
--     ),
--     (
--         '22222222-2222-2222-2222-222222222222',
--         '{"username": "Second", "birthday": "1901-01-01"}'
--     ),
--     (
--         '33333333-3333-3333-3333-333333333333',
--         '{"username": "Third", "birthday": "1801-01-01"}'
--     ),
--     (
--         '44444444-4444-4444-4444-444444444444',
--         '{"username": "Fourth", "birthday": "1701-01-01"}'
--     );

-- -- Set min and max age settings for users
-- update public.settings
-- set
--     min_age = 18,
--     max_age = 30
-- where
--     id = '11111111-1111-1111-1111-111111111111';

-- -- Authenticate as First User
-- set
--     local "request.jwt.claims" to '{"sub": "11111111-1111-1111-1111-111111111111" }';

-- set role 'authenticated';

-- -- Only First and Second users match First User's settings
-- select
--     results_eq (
--         'select id from public.get_compatible_profiles()',
--         $$values ('11111111-1111-1111-1111-111111111111'::uuid), ('22222222-2222-2222-2222-222222222222'::uuid)$$
--     );

-- -- Cleanup
-- reset role;

-- delete from auth.users
-- where
--     id = '11111111-1111-1111-1111-111111111111';

-- delete from auth.users
-- where
--     id = '22222222-2222-2222-2222-222222222222';

select
    *
from
    finish ();

rollback;
