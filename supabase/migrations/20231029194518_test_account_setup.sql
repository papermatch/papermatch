drop policy if exists "Non-blocked-by profiles are viewable." on profiles;

create policy "Non-blocked-by profiles are viewable." on profiles as restrictive for
select
    using (not public.is_profile_blocked (id, auth.uid ()));

-- Need at least one non-restrictive policy to allow public profiles to be viewable by default
create policy "Public profiles are viewable by everyone." on profiles for
select
    using (true);

create function get_test_id () returns uuid as $$
declare
  test_id uuid;
begin
  select decrypted_secret::uuid
  into test_id
  from vault.decrypted_secrets
  where name = 'TEST_USER_ID'
  limit 1;

  return COALESCE(test_id, null);
end;
$$ language plpgsql security definer stable;

create policy "Test user is only viewable by test user." on profiles as restrictive for
select
    using (
        get_test_id () is null or
        id <> get_test_id () or
        auth.uid () = get_test_id ()
    );

-- https://github.com/orgs/supabase/discussions/10298#discussioncomment-6403374
create function set_test_otp () returns trigger as $$
begin
    if (new.id = public.get_test_id ()) then
        new.recovery_token := encode(sha224(concat(new.email, '123456')::bytea), 'hex');
        new.recovery_sent_at := now() - interval '2 minutes';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger set_test_otp before insert or
update on auth.users for each row
execute procedure public.set_test_otp ();

drop view if exists active;

create materialized view
    public.active as
select
    user_id as id
from
    public.credits
group by
    user_id
having
    sum(credits) > 0;

create function refresh_active_view () returns trigger as $$
begin
  refresh materialized view public.active;
  return new;
end;
$$ language plpgsql security definer;

create trigger refresh_active_view
after insert or
update or
delete on public.credits for each statement
execute function refresh_active_view ();

create or
replace function public.get_active_profiles () returns setof profiles as $$
begin
    return query
        select p.*
        from public.profiles as p
        join public.active as a on p.id = a.id;
end;
$$ language plpgsql;

create or
replace function public.search_active_profiles (
    hide_interactions boolean default false,
    hide_preferences boolean default false
) returns table (
    profile public.profiles,
    distance float,
    score float
) as $$
begin
    return query
    with q as (
        select
            p,
            public.get_user_distance(auth.uid(), p.id) as d,
            public.get_user_score(auth.uid(), p.id) as s
        from
            public.get_active_profiles() as p
            left join public.interactions i on i.user_id = auth.uid() and i.target_id = p.id
        where
            p.id != auth.uid()
            and (
                i.interaction is null
                or (
                    i.interaction != 'block'
                    and (
                        not hide_interactions or i.interaction = 'none'
                    )
                )
            )
    )
    select
        p, d, s
    from
        q
    where
        not hide_preferences or s >= 10.0 or s is null
    order by
        s desc;
end;
$$ language plpgsql;
