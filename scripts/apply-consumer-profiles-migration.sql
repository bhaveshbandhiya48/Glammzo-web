-- Run once in Supabase SQL Editor (Dashboard → SQL → New query)
-- Creates the Glammzo-web consumer profile table keyed by phone.

create table if not exists public.consumer_profiles (
  consumer_phone_normalized text primary key,
  full_name text,
  email text,
  gender text,
  date_of_birth date,
  address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint consumer_profiles_phone_not_blank check (char_length(trim(consumer_phone_normalized)) > 0),
  constraint consumer_profiles_gender_check check (
    gender is null
    or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say', 'other')
  )
);

create index if not exists consumer_profiles_updated_at_idx
  on public.consumer_profiles (updated_at desc);

comment on table public.consumer_profiles is
  'Platform-wide consumer profile for Glammzo-web, keyed by normalized phone.';
