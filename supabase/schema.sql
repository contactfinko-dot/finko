-- ============================================================
-- FINKO — Schéma complet de la base de données
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── POSTS ────────────────────────────────────────────────────
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  prenom      text not null,
  content     text not null,
  category    text not null default 'general',
  image_url   text,
  link_url    text,
  link_title  text,
  created_at  timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Lecture publique des posts"
  on public.posts for select using (true);

create policy "Publier : membres connectés"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Supprimer : son propre post"
  on public.posts for delete using (auth.uid() = user_id);

-- ── LIKES (réactions emoji) ──────────────────────────────────
create table public.likes (
  post_id        uuid not null references public.posts(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  reaction_type  text not null,
  created_at     timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Lecture publique des réactions"
  on public.likes for select using (true);

create policy "Réagir : membres connectés"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Modifier sa réaction"
  on public.likes for update using (auth.uid() = user_id);

create policy "Retirer sa réaction"
  on public.likes for delete using (auth.uid() = user_id);

-- ── COMMENTS ─────────────────────────────────────────────────
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  prenom      text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Lecture publique des commentaires"
  on public.comments for select using (true);

create policy "Commenter : membres connectés"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Supprimer son commentaire"
  on public.comments for delete using (auth.uid() = user_id);

-- ── BOOKMARKS ────────────────────────────────────────────────
create table public.bookmarks (
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.bookmarks enable row level security;

create policy "Voir ses propres favoris"
  on public.bookmarks for select using (auth.uid() = user_id);

create policy "Ajouter un favori"
  on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Retirer un favori"
  on public.bookmarks for delete using (auth.uid() = user_id);

-- ── FOLLOWS ──────────────────────────────────────────────────
create table public.follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  followed_id  uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, followed_id)
);

alter table public.follows enable row level security;

create policy "Lecture publique des follows"
  on public.follows for select using (true);

create policy "Suivre : membres connectés"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Ne plus suivre"
  on public.follows for delete using (auth.uid() = follower_id);

-- ── NOTIFICATIONS ────────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,             -- like | comment | follow | post
  content     text not null,
  from_user   text,
  post_id     uuid references public.posts(id) on delete cascade,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Voir ses notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Créer une notification : membres connectés"
  on public.notifications for insert with check (auth.uid() is not null);

create policy "Marquer comme lu"
  on public.notifications for update using (auth.uid() = user_id);

-- ── SENTIMENT VOTES (Radar de sentiment) ─────────────────────
create table public.sentiment_votes (
  user_id     uuid not null references auth.users(id) on delete cascade,
  asset       text not null,             -- ex: "ETF WORLD", "BTC"
  sentiment   text not null,             -- bullish | neutral | bearish
  week_key    text not null,             -- ex: "2026-W27"
  created_at  timestamptz not null default now(),
  primary key (user_id, asset, week_key)
);

alter table public.sentiment_votes enable row level security;

create policy "Lecture publique des votes"
  on public.sentiment_votes for select using (true);

create policy "Voter : membres connectés"
  on public.sentiment_votes for insert with check (auth.uid() = user_id);

create policy "Changer son vote"
  on public.sentiment_votes for update using (auth.uid() = user_id);

-- ── PROPHET SCORES (leaderboard prédictions) ─────────────────
create table public.prophet_scores (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  prenom               text not null,
  total_predictions    integer not null default 0,
  correct_predictions  integer not null default 0,
  xp                   integer not null default 0,
  last_verified_week   text,
  updated_at           timestamptz not null default now()
);

alter table public.prophet_scores enable row level security;

create policy "Lecture publique du leaderboard"
  on public.prophet_scores for select using (true);

create policy "Créer son score"
  on public.prophet_scores for insert with check (auth.uid() = user_id);

create policy "Mettre à jour son score"
  on public.prophet_scores for update using (auth.uid() = user_id);

-- ── INDEX ────────────────────────────────────────────────────
create index posts_created_at_idx      on public.posts (created_at desc);
create index posts_category_idx        on public.posts (category);
create index comments_post_id_idx      on public.comments (post_id);
create index notifications_user_idx    on public.notifications (user_id, created_at desc);
create index sentiment_asset_week_idx  on public.sentiment_votes (asset, week_key);

-- ── REALTIME (feed + notifications en direct) ────────────────
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.notifications;

-- ── STORAGE : bucket avatars ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Lecture publique des avatars"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Upload de son avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "Remplacer son avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());

create policy "Supprimer son avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());
