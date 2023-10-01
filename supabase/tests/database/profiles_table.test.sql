begin;

select
    plan (5);

select
    has_table (
        'public',
        'profiles',
        'profiles table should exist'
    );

select
    columns_are (
        'public',
        'profiles',
        array[
            'id',
            'updated_at',
            'username',
            'avatar_url',
            'birthday',
            'gender',
            'have_kids',
            'want_kids',
            'location',
            'about'
        ]
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
        'id should be a foreign key referencing auth.users(id)'
    );

select
    indexes_are (
        'public',
        'profiles',
        array['profiles_pkey', 'profiles_username_key']
    );

select
    *
from
    finish ();

rollback;
