begin;

select
    plan (3);

select
    has_function (
        'public',
        'is_profile_blocked',
        'is_profile_blocked function should exist'
    );

-- Setup
insert into
    auth.users (id)
values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

select
    results_eq (
        'select * from is_profile_blocked(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (false::boolean)$$
    );

insert into
    public.interactions (user_id, target_id, interaction)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'block'
    );

-- First User has blocked Second User
select
    results_eq (
        'select * from is_profile_blocked(''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'')',
        $$values (true::boolean)$$
    );

-- Cleanup
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
