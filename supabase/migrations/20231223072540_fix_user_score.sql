create function public.get_users_score (user1_id uuid, user2_id uuid) returns float as $$
begin
    return public.get_mean_score(
        public.get_user_score(user1_id, user2_id),
        public.get_user_score(user2_id, user1_id)
    );
end;
$$ language plpgsql;
