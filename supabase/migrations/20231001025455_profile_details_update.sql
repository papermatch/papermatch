create type gender_type as enum('none', 'male', 'female', 'nonbinary');

alter table profiles
drop column if exists website;

alter table profiles
drop column if exists full_name;

alter table profiles
add column birthday date;

alter table profiles
add column gender gender_type;

alter table profiles
add column have_kids boolean;

alter table profiles
add column want_kids boolean;

alter table profiles
add column location point;

alter table profiles
add column about text;

create or
replace function public.handle_new_user () returns trigger as $$
begin
    insert into public.profiles (id, username, birthday)
    values (new.id, new.raw_user_meta_data->>'username', (new.raw_user_meta_data->>'birthday')::date);

    insert into public.credits (user_id, creditor, credits, created_at)
    VALUES (new.id, 'init', 1, now());

    return new;
end;
$$ language plpgsql security definer;
