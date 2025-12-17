-- Enable the UUID extension
create extension if not exists "uuid-ossp";

-- Create the sales table
create table public.sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  customer_name text not null,
  service_name text not null,
  amount numeric not null,
  date date not null,
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the expenses table
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.sales enable row level security;
alter table public.expenses enable row level security;

-- Create policies for sales
create policy "Users can view their own sales" on public.sales
  for select using (auth.uid() = user_id);

create policy "Users can insert their own sales" on public.sales
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own sales" on public.sales
  for update using (auth.uid() = user_id);

create policy "Users can delete their own sales" on public.sales
  for delete using (auth.uid() = user_id);

-- Create policies for expenses
create policy "Users can view their own expenses" on public.expenses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own expenses" on public.expenses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own expenses" on public.expenses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own expenses" on public.expenses
  for delete using (auth.uid() = user_id);
