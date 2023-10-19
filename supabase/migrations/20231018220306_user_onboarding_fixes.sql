alter table public.profiles
add constraint avatar_urls_limit check (array_length(avatar_urls, 1) <= 6);

alter table public.preferences
alter column updated_at
drop default,
alter column updated_at
drop not null;
