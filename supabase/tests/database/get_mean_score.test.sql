begin;

select
    plan (6);

select
    has_function (
        'public',
        'get_mean_score',
        'get_mean_score function should exist'
    );

select
    results_eq (
        'select public.get_mean_score(null, 3.0)',
        'values (null::float)'
    );

select
    results_eq (
        'select public.get_mean_score(5.0, null)',
        'values (5.0::float)'
    );

select
    results_eq (
        'select public.get_mean_score(0.0, 3.0)',
        'values (0.0::float)'
    );

select
    results_eq (
        'select public.get_mean_score(5.0, 0.0)',
        'values (0.0::float)'
    );

select
    results_eq (
        'select public.get_mean_score(5.0, 3.0)',
        'values (3.75::float)'
    );

-- Cleanup
select
    *
from
    finish ();

rollback;
