begin;

select
    plan (6);

select
    has_table ('public', 'reports', 'reports table should exist');

select
    columns_are (
        'public',
        'reports',
        array[
            'id',
            'user_id',
            'reporter_id',
            'reason',
            'details',
            'created_at'
        ]
    );

select
    col_is_pk (
        'public',
        'reports',
        'id',
        'id should be a primary key'
    );

select
    col_is_fk (
        'public',
        'reports',
        'user_id',
        'user_id should be a foreign key referencing auth.users(id)'
    );

select
    col_is_fk (
        'public',
        'reports',
        'reporter_id',
        'reporter_id should be a foreign key referencing auth.users(id)'
    );

select
    indexes_are ('public', 'reports', array['reports_pkey']);

select
    *
from
    finish ();

rollback;
