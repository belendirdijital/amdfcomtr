-- Takım logosu (data URL, PNG). Boşsa sitede renk + baş harf rozeti gösterilir.

alter table public.teams add column if not exists logo_url text;
