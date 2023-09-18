begin;

select
    plan (5);

select
    has_table ('public', 'credits', 'credits table should exist');

select
    has_type (
        'public',
        'creditor_type',
        'creditor_type should exist'
    );

select
    columns_are (
        'public',
        'credits',
        array[
            'id',
            'user_id',
            'creditor',
            'creditor_id',
            'credits',
            'created_at'
        ]
    );

select
    col_is_pk (
        'public',
        'credits',
        'id',
        'id should be primary key'
    );

select
    indexes_are (
        'public',
        'credits',
        array['credits_pkey', 'idx_credits_user_id']
    );

select
    *
from
    finish ();

rollback;
