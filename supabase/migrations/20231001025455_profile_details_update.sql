create type gender_type as enum('male', 'female', 'nonbinary');

create type kids_type as enum('none', 'unsure', 'want', 'have', 'more');

alter table profiles
drop column if exists website;

alter table profiles
drop column if exists full_name;

alter table profiles
add column birthday date;

alter table profiles
add column gender gender_type;

alter table profiles
add column kids kids_type;

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

create function public.delete_current_user () returns void as $$
begin
    delete from auth.users where id = auth.uid();
    return; 
end;
$$ language plpgsql security definer;
