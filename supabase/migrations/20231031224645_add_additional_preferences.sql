create type religion_type as enum(
    'agnostic',
    'atheist',
    'buddhist',
    'catholic',
    'christian',
    'hindu',
    'jewish',
    'muslim',
    'spiritual',
    'other'
);

create type education_type as enum('high', 'undergrad', 'postgrad');

create type sexuality_type as enum(
    'straight',
    'gay',
    'lesbian',
    'bi',
    'pan',
    'demi',
    'ace',
    'other'
);

alter table public.profiles
add column religion public.religion_type;

alter table public.profiles
add column education public.education_type;

alter table public.profiles
add column sexuality public.sexuality_type;

alter table public.preferences
add column religion public.religion_type[];

alter table public.preferences
add column education public.education_type[];

alter table public.preferences
add column sexuality public.sexuality_type[];
