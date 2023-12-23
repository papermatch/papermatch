drop function public.get_users_score (uuid, uuid);

create function public.get_users_score (user_id uuid) returns float as $$
begin
    if public.is_profile_blocked (user_id, auth.uid ()) then
        return null;
    end if;
    
    return public.get_mean_score(
        public.get_user_score(auth.uid (), user_id),
        public.get_user_score(user_id, auth.uid ())
    );
end;
$$ language plpgsql security definer;
