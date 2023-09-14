begin;

select
    plan (8);

select
    has_table (
        'public',
        'interactions',
        'interactions table should exist'
    );

select
    has_type (
        'public',
        'interaction_type',
        'interaction_type should exist'
    );

select
    columns_are (
        'public',
        'interactions',
        array[
            'user_id',
            'target_id',
            'interaction',
            'updated_at'
        ]
    );

select
    col_is_pk (
        'public',
        'interactions',
        array['user_id', 'target_id'],
        'user_id and target_id should be a composite primary key'
    );

select
    col_is_fk (
        'public',
        'interactions',
        'user_id',
        'user_id should reference auth.users id'
    );

select
    col_is_fk (
        'public',
        'interactions',
        'target_id',
        'target_id should reference auth.users id'
    );

select
    indexes_are (
        'public',
        'interactions',
        array['interactions_pkey']
    );

select
    policies_are (
        'public',
        'interactions',
        array[
            'User can see own interactions.',
            'User can add own interactions (but not with themselves).',
            'Users can update own interactions.'
        ]
    );

select
    *
from
    finish ();

rollback;
