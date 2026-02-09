-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('owner', 'manager')),
  assigned_store_id uuid references public.stores(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create stores table
create table public.stores (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  district text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.stores enable row level security;
create policy "Stores are viewable by everyone." on stores for select using (true);

-- Create orders table if not exists (base structure)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text,
  phone text,
  address text,
  store_id uuid references public.stores(id),
  status text default 'pending',
  total_price numeric,
  items jsonb
);

-- Enable RLS
alter table public.orders enable row level security;
create policy "Orders are viewable by admins." on orders for select using (true); -- simplify for demo
