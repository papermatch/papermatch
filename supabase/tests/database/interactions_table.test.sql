select
    plan (10);

select
    has_table (
        'public',
        'interactions',
        'interactions table should exist'
    );

select
    has_column (
        'public',
        'interactions',
        'user_id',
        'user_id column should exist'
    );

select
    has_column (
        'public',
        'interactions',
        'target_id',
        'target_id column should exist'
    );

select
    has_column (
        'public',
        'interactions',
        'interaction',
        'interaction column should exist'
    );

select
    has_column (
        'public',
        'interactions',
        'updated_at',
        'updated_at column should exist'
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
    results_eq (
        'select interaction from interactions',
        $$values ('like'::interaction_type), ('like'::interaction_type), ('block'::interaction_type)$$,
        'interactions should return all interactions'
    );

select
    *
from
    finish ();

rollback;
