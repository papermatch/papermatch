create or
replace function public.get_active_profiles () returns setof profiles as $$
begin
    return query
        select p.*
        from public.profiles as p
        join (
            select user_id
            from public.credits
            group by user_id
            having sum(credits) > 0
        ) as c on p.id = c.user_id;
end;
$$ language plpgsql;

create function public.is_profile_blocked (user1_id uuid, user2_id uuid) returns boolean as $$
declare
  is_blocked boolean;
begin
  select
    into is_blocked
    exists (
      select
        1
      from
        interactions
      where
        user_id = user1_id and
        target_id = user2_id and
        interaction = 'block'
    );
  return is_blocked;
end;
$$ language plpgsql security definer;

drop policy if exists "Non-blocked-by profiles are viewable." on profiles;

create policy "Non-blocked-by profiles are viewable." on profiles for
select
  using (not public.is_profile_blocked (id, auth.uid ()));
