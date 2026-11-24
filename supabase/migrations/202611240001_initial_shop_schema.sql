-- Initial schema for Hinterländer Hof – Laden
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  category text not null default 'Hofprodukte',
  image_url text,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  active boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_email text not null,
  customer_name text not null,
  shipping_address jsonb not null,
  billing_address jsonb,
  payment_method text not null check (payment_method in ('paypal','bank_transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'new' check (order_status in ('new','processing','shipped','completed','cancelled')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_cost numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total numeric(10,2) not null check (total >= 0),
  paypal_order_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists products_active_sort_idx on public.products(active, sort_order);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.products, public.orders, public.order_items from anon, authenticated;
grant select on table public.products to anon, authenticated;
grant all on table public.products, public.orders, public.order_items to authenticated;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products for select to anon, authenticated
using (active = true or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
on public.orders for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items"
on public.order_items for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
