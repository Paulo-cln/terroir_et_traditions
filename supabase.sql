-- Tables de commandes pour l’association

create extension if not exists pgcrypto;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  email text,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  country text,
  amount_total integer,
  currency text,
  created_at timestamp with time zone default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_name text,
  quantity integer,
  unit_amount integer,
  currency text
);

create index if not exists order_items_order_id_idx on order_items(order_id);