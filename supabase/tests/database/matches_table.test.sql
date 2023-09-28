begin;

select
    plan (6);

select
    has_table ('public', 'matches', 'matches table should exist');

select
    columns_are (
        'public',
        'matches',
        array[
            'id',
            'user1_id',
            'user2_id',
            'active',
            'updated_at'
        ]
    );

select
    col_is_pk (
        'public',
        'matches',
        'id',
        'id should be primary key'
    );

select
    col_is_fk (
        'public',
        'matches',
        'user1_id',
        'user1_id should have a foreign key referencing auth.users(id)'
    );

select
    col_is_fk (
        'public',
        'matches',
        'user2_id',
        'user2_id should have a foreign key referencing auth.users(id)'
    );

select
    col_default_is (
        'public',
        'matches',
        'active',
        'true',
        'active column should have a default value of true'
    );

select
    *
from
    finish ();

rollback;
