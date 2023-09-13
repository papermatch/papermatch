begin;

select
    plan (11);

select
    has_table (
        'public',
        'profiles',
        'profiles table should exist'
    );

select
    has_column ('public', 'profiles', 'id', 'id should exist');

select
    has_column (
        'public',
        'profiles',
        'updated_at',
        'updated_at should exist'
    );

select
    has_column (
        'public',
        'profiles',
        'username',
        'username should exist'
    );

select
    has_column (
        'public',
        'profiles',
        'full_name',
        'full_name should exist'
    );

select
    has_column (
        'public',
        'profiles',
        'avatar_url',
        'avatar_url should exist'
    );

select
    has_column (
        'public',
        'profiles',
        'website',
        'website should exist'
    );

select
    col_is_pk (
        'public',
        'profiles',
        'id',
        'id should be a primary key'
    );

select
    col_is_fk (
        'public',
        'profiles',
        'id',
        'id should be a foreign key'
    );

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

select
    results_eq (
        'select username from profiles',
        $$values ('Alice'), ('Bob'), ('Charlie'), ('Dana')$$,
        'profiles should return all usernames'
    );

select
    *
from
    finish ();

rollback;
