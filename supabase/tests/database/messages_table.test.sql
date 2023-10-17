begin;

select
    plan (5);

select
    has_table (
        'public',
        'messages',
        'messages table should exist'
    );

select
    columns_are (
        'public',
        'messages',
        array[
            'id',
            'match_id',
            'user_id',
            'message',
            'created_at',
            'is_read'
        ]
    );

select
    col_is_pk (
        'public',
        'messages',
        'id',
        'id should be primary key'
    );

select
    col_is_fk (
        'public',
        'messages',
        'match_id',
        'match_id should have a foreign key referencing public.matches(id)'
    );

select
    col_is_fk (
        'public',
        'messages',
        'user_id',
        'user_id should have a foreign key referencing auth.users(id)'
    );

select
    *
from
    finish ();

rollback;
