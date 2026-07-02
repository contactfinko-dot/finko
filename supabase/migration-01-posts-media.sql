-- ============================================================
-- Migration 01 — À exécuter UNIQUEMENT si tu as déjà lancé
-- schema.sql avant l'ajout des colonnes photo/lien.
-- (Sinon, schema.sql à jour suffit.)
-- ============================================================

alter table public.posts add column if not exists image_url  text;
alter table public.posts add column if not exists link_url   text;
alter table public.posts add column if not exists link_title text;
