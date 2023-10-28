begin;

select
    plan (2);

select
    has_function (
        'public',
        'handle_new_message',
        'handle_new_message function should exist'
    );

select
    has_trigger (
        'public',
        'messages',
        'after_message_created',
        'after_message_created trigger should exist'
    );

-- Cleanup
select
    *
from
    finish ();

rollback;
