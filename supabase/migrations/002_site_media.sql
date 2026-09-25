-- Homepage slider & promotional banners (admin-managed, optional on public site)

create table public.site_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null,
  title_highlight text not null default '',
  description text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  image_url text not null,
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.site_banners (
  id uuid primary key default gen_random_uuid(),
  category text not null default '',
  title text not null,
  description text not null default '',
  button_label text not null default '',
  href text not null default '',
  image_url text not null,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index site_slides_order_idx on public.site_slides (sort_order);
create index site_banners_order_idx on public.site_banners (sort_order);

alter table public.site_slides enable row level security;
alter table public.site_banners enable row level security;

-- Public can read enabled items; admin sees all
create policy "site_slides_public_read"
  on public.site_slides for select
  using (enabled = true or public.is_admin());

create policy "site_slides_admin_write"
  on public.site_slides for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_banners_public_read"
  on public.site_banners for select
  using (enabled = true or public.is_admin());

create policy "site_banners_admin_write"
  on public.site_banners for all
  using (public.is_admin())
  with check (public.is_admin());
