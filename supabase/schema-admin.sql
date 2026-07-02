-- ============================================================
-- FINKO — Back-office : rôles, modération, contenu éditable
-- ============================================================

-- ── PROFILES (miroir public de auth.users, alimenté par trigger) ──
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  prenom      text,
  nom         text,
  created_at  timestamptz not null default now()
);

-- ── ADMINS + fonction de vérification ────────────────────────
create table public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'admin',   -- admin | moderateur
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer stable
set search_path = public
as $$ select exists(select 1 from public.admins where user_id = uid); $$;

alter table public.admins enable row level security;
create policy "Voir son propre rôle ou admin" on public.admins
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "Admins gèrent les rôles (insert)" on public.admins
  for insert with check (public.is_admin(auth.uid()));
create policy "Admins gèrent les rôles (delete)" on public.admins
  for delete using (public.is_admin(auth.uid()));

alter table public.profiles enable row level security;
create policy "Voir son profil ou admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

-- Trigger : nouveau compte → ligne dans profiles
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, prenom, nom, created_at)
  values (new.id, new.email, new.raw_user_meta_data->>'prenom', new.raw_user_meta_data->>'nom', new.created_at)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rattrapage des comptes existants
insert into public.profiles (id, email, prenom, nom, created_at)
select id, email, raw_user_meta_data->>'prenom', raw_user_meta_data->>'nom', created_at
from auth.users
on conflict (id) do nothing;

-- ── SIGNALEMENTS ──────────────────────────────────────────────
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references public.posts(id) on delete cascade,
  comment_id   uuid references public.comments(id) on delete cascade,
  reporter_id  uuid not null references auth.users(id) on delete cascade,
  reason       text not null,
  status       text not null default 'pending',   -- pending | resolved | dismissed
  created_at   timestamptz not null default now()
);

alter table public.reports enable row level security;
create policy "Signaler : membres connectés" on public.reports
  for insert with check (auth.uid() = reporter_id);
create policy "Voir : ses signalements ou admin" on public.reports
  for select using (reporter_id = auth.uid() or public.is_admin(auth.uid()));
create policy "Traiter : admin" on public.reports
  for update using (public.is_admin(auth.uid()));

-- ── BANNISSEMENTS ─────────────────────────────────────────────
create table public.banned_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  reason      text,
  banned_by   uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table public.banned_users enable row level security;
create policy "Voir : soi-même ou admin" on public.banned_users
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "Bannir : admin" on public.banned_users
  for insert with check (public.is_admin(auth.uid()));
create policy "Débannir : admin" on public.banned_users
  for delete using (public.is_admin(auth.uid()));

-- Un membre banni ne peut plus publier (politiques restrictives)
create policy "Bannis : pas de posts" on public.posts
  as restrictive for insert
  with check (not exists (select 1 from public.banned_users b where b.user_id = auth.uid()));
create policy "Bannis : pas de commentaires" on public.comments
  as restrictive for insert
  with check (not exists (select 1 from public.banned_users b where b.user_id = auth.uid()));

-- Les admins peuvent supprimer n'importe quel contenu
create policy "Admin supprime posts" on public.posts
  for delete using (public.is_admin(auth.uid()));
create policy "Admin supprime commentaires" on public.comments
  for delete using (public.is_admin(auth.uid()));

-- ── WEBINAIRES (gérés depuis l'admin) ─────────────────────────
create table public.webinars (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text not null default 'Général',
  host_name   text,
  host_role   text,
  date_label  text,        -- ex : "24 juin · 18h30"
  inscrits    integer not null default 0,
  status      text not null default 'upcoming',  -- upcoming | live | replay | brouillon
  featured    boolean not null default false,
  accent      text not null default '#1D9E75',
  created_at  timestamptz not null default now()
);

alter table public.webinars enable row level security;
create policy "Lecture publique webinaires" on public.webinars
  for select using (true);
create policy "Admin gère webinaires (insert)" on public.webinars
  for insert with check (public.is_admin(auth.uid()));
create policy "Admin gère webinaires (update)" on public.webinars
  for update using (public.is_admin(auth.uid()));
create policy "Admin gère webinaires (delete)" on public.webinars
  for delete using (public.is_admin(auth.uid()));

-- ── GLOSSAIRE (termes ajoutés depuis l'admin) ─────────────────
create table public.glossary_terms (
  id          uuid primary key default gen_random_uuid(),
  term        text not null,
  slug        text not null unique,
  definition  text not null,
  category    text not null default 'Général',
  created_at  timestamptz not null default now()
);

alter table public.glossary_terms enable row level security;
create policy "Lecture publique glossaire" on public.glossary_terms
  for select using (true);
create policy "Admin gère glossaire (insert)" on public.glossary_terms
  for insert with check (public.is_admin(auth.uid()));
create policy "Admin gère glossaire (update)" on public.glossary_terms
  for update using (public.is_admin(auth.uid()));
create policy "Admin gère glossaire (delete)" on public.glossary_terms
  for delete using (public.is_admin(auth.uid()));

-- ── ANNONCES (bannière épinglée dans la communauté) ───────────
create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text,
  pinned      boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;
create policy "Lecture publique annonces" on public.announcements
  for select using (true);
create policy "Admin gère annonces (insert)" on public.announcements
  for insert with check (public.is_admin(auth.uid()));
create policy "Admin gère annonces (update)" on public.announcements
  for update using (public.is_admin(auth.uid()));
create policy "Admin gère annonces (delete)" on public.announcements
  for delete using (public.is_admin(auth.uid()));

-- ── CONTENUS DU SITE (textes/chiffres éditables) ──────────────
create table public.site_content (
  key         text primary key,
  label       text not null,
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.site_content enable row level security;
create policy "Lecture publique contenus" on public.site_content
  for select using (true);
create policy "Admin gère contenus (insert)" on public.site_content
  for insert with check (public.is_admin(auth.uid()));
create policy "Admin gère contenus (update)" on public.site_content
  for update using (public.is_admin(auth.uid()));

-- Valeurs par défaut éditables
insert into public.site_content (key, label, value) values
  ('membres_total',      'Nombre de membres affiché',        '2 400'),
  ('hero_titre',         'Titre de la page d''accueil',      'La finance, on en parle ensemble'),
  ('hero_sous_titre',    'Sous-titre de la page d''accueil', 'Rejoins des curieux qui partagent leurs expériences d''investissement. Sans jargon, sans vendeur, entre pairs.'),
  ('webinaires_count',   'Nombre de webinaires affiché',     '12'),
  ('contact_email',      'Email de contact',                 'partenariats@finko.fr')
on conflict (key) do nothing;

-- ── INDEX ─────────────────────────────────────────────────────
create index reports_status_idx on public.reports (status, created_at desc);
create index webinars_status_idx on public.webinars (status, featured);
