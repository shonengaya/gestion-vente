-- Create products table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  type text not null check (type in ('ART', 'SRV')), -- Article (stock managed) or Service (no stock)
  price numeric not null default 0,
  stock int not null default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- Policies
create policy "Users can view own products" 
  on public.products for select 
  using (auth.uid() = user_id);

create policy "Users can insert own products" 
  on public.products for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own products" 
  on public.products for update 
  using (auth.uid() = user_id);

create policy "Users can delete own products" 
  on public.products for delete 
  using (auth.uid() = user_id);
