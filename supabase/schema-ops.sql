-- ============================================================
-- FINKO — Opérations : captures d'emails, mots interdits
-- ============================================================

-- ── CAPTURES D'EMAILS (newsletter + inscriptions webinaires) ──
-- source : 'landing', 'webinaire-alertes', 'webinaire-<slug>', 'entreprise'…
create table public.email_captures (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text not null default 'landing',
  created_at  timestamptz not null default now(),
  unique (email, source)
);

alter table public.email_captures enable row level security;
-- Tout le monde peut s'inscrire (même non connecté)
create policy "Capture publique" on public.email_captures
  for insert with check (true);
-- Seuls les admins voient la liste
create policy "Admin voit les emails" on public.email_captures
  for select using (public.is_admin(auth.uid()));
create policy "Admin supprime les emails" on public.email_captures
  for delete using (public.is_admin(auth.uid()));

-- ── MOTS INTERDITS (filtre anti-arnaque à la publication) ─────
create table public.banned_words (
  word        text primary key,
  created_at  timestamptz not null default now()
);

alter table public.banned_words enable row level security;
-- Lecture publique : le client vérifie avant publication
create policy "Lecture publique mots interdits" on public.banned_words
  for select using (true);
create policy "Admin gère mots interdits (insert)" on public.banned_words
  for insert with check (public.is_admin(auth.uid()));
create policy "Admin gère mots interdits (delete)" on public.banned_words
  for delete using (public.is_admin(auth.uid()));

-- Liste de départ : arnaques classiques
insert into public.banned_words (word) values
  ('gains garantis'),
  ('rendement garanti'),
  ('argent facile'),
  ('devenir riche rapidement'),
  ('contactez-moi en privé'),
  ('mon telegram'),
  ('whatsapp moi'),
  ('signal gratuit'),
  ('trading signals'),
  ('récupérer vos fonds perdus')
on conflict do nothing;

create index email_captures_source_idx on public.email_captures (source, created_at desc);
