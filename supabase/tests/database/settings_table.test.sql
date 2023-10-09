begin;

select
    plan (5);

select
    has_table (
        'public',
        'preferences',
        'preferences table should exist'
    );

select
    columns_are (
        'public',
        'preferences',
        array[
            'id',
            'min_age',
            'max_age',
            'gender',
            'kids',
            'radius',
            'keywords',
            'updated_at'
        ]
    );

select
    col_is_pk (
        'public',
        'preferences',
        'id',
        'id should be a primary key'
    );

select
    col_is_fk (
        'public',
        'preferences',
        'id',
        'id should be a foreign key referencing auth.users(id)'
    );

select
    indexes_are (
        'public',
        'preferences',
        array['preferences_pkey']
    );

select
    *
from
    finish ();

rollback;
