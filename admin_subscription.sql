-- ==========================================
-- SCRIPT COMPLET D'ADMINISTRATION PROLOW5
-- ==========================================

-- 1. Table Profiles (si pas encore créée)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  subscription_expires_at timestamptz not null,
  role text default 'user',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Trigger pour créer automatiquement le profil à l'inscription (3 jours d'essai)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, subscription_expires_at, role, is_active)
  values (
    new.id, 
    new.email, 
    (now() + interval '3 days'), -- 3 jours d'essai
    'user',
    true
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Trigger pour mettre à jour l'email si l'utilisateur le change
create or replace function public.handle_user_email_update() 
returns trigger as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute procedure public.handle_user_email_update();

-- ==========================================
-- FONCTIONS SÉCURISÉES (RPC) POUR L'ADMIN
-- ==========================================

-- 4. Récupérer tous les profils (Admin seulement)
create or replace function get_all_profiles_admin()
returns setof public.profiles
language plpgsql
security definer
as $$
begin
  -- Vérification : Email Admin en dur
  if (auth.jwt() ->> 'email') <> 'andriantahirynomena@gmail.com' then
    raise exception 'Accès refusé.';
  end if;

  return query select * from public.profiles order by created_at desc;
end;
$$;

-- 5. Prolonger l'abonnement (Admin seulement)
create or replace function extend_subscription_admin(target_user_id uuid, months_to_add int)
returns public.profiles
language plpgsql
security definer
as $$
declare
  updated_profile public.profiles;
  current_expiry timestamptz;
  new_expiry timestamptz;
begin
  if (auth.jwt() ->> 'email') <> 'andriantahirynomena@gmail.com' then
    raise exception 'Accès refusé.';
  end if;

  select subscription_expires_at into current_expiry from public.profiles where id = target_user_id;
  
  -- Si déjà expiré, on part d'aujourd'hui. Sinon on ajoute à la fin.
  if current_expiry > now() then
    new_expiry := current_expiry + (months_to_add || ' months')::interval;
  else
    new_expiry := now() + (months_to_add || ' months')::interval;
  end if;

  update public.profiles
  set subscription_expires_at = new_expiry
  where id = target_user_id
  returning * into updated_profile;

  return updated_profile;
end;
$$;

-- 6. Activer / Désactiver un utilisateur (Admin seulement)
-- Note: returns setof pour compatibilité tableau
create or replace function toggle_user_active_status_admin(target_user_id uuid, new_status boolean)
returns setof public.profiles
language plpgsql
security definer
as $$
begin
  if (auth.jwt() ->> 'email') <> 'andriantahirynomena@gmail.com' then
    raise exception 'Accès refusé.';
  end if;

  return query
  update public.profiles
  set is_active = new_status
  where id = target_user_id
  returning *;
end;
$$;

-- ==========================================
-- POLITIQUES DE SÉCURITÉ (RLS)
-- ==========================================

alter table public.profiles enable row level security;

-- Nettoyer les anciennes politiques
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admin can view all profiles" on public.profiles;
drop policy if exists "Admin can update profiles" on public.profiles;

-- Politique SIMPLE : Chacun voit son propre profil
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- (Les admins passent par les fonctions RPC ci-dessus, donc pas besoin de politique SELECT * sur la table)
