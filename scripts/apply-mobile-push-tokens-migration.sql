-- Run once in Supabase SQL Editor (Dashboard → SQL → New query)
-- Stores Expo push tokens for Glammzo mobile consumers (keyed by phone).

create table if not exists public.mobile_push_tokens (
  id uuid primary key default gen_random_uuid(),
  consumer_phone_normalized text not null,
  expo_push_token text not null,
  platform text,
  device_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint mobile_push_tokens_phone_not_blank check (
    char_length(trim(consumer_phone_normalized)) > 0
  ),
  constraint mobile_push_tokens_token_not_blank check (
    char_length(trim(expo_push_token)) > 0
  ),
  constraint mobile_push_tokens_platform_check check (
    platform is null or platform in ('ios', 'android', 'web', 'unknown')
  )
);

create unique index if not exists mobile_push_tokens_token_uidx
  on public.mobile_push_tokens (expo_push_token);

create index if not exists mobile_push_tokens_phone_idx
  on public.mobile_push_tokens (consumer_phone_normalized);

comment on table public.mobile_push_tokens is
  'Expo push tokens for Glammzo consumer mobile app, keyed by normalized phone.';
