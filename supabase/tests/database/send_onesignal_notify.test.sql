begin;

select
    plan (2);

select
    has_function (
        'public',
        'send_onesignal_notify',
        'send_onesignal_notify function should exist'
    );

-- Should return false because SUPABASE_URL is not set in Vault
select
    results_eq (
        'select * from public.send_onesignal_notify(''11111111-1111-1111-1111-111111111111'', ''Test message!'')',
        $$values (false)$$
    );

-- Cleanup
select
    *
from
    finish ();

rollback;
