/*
# Create saved_formulae table

## Purpose
Stores formulae topics that users save for quick access. The app has no
sign-in, so all saved formulae are shared/public in a single-tenant model.

## New Tables
- `saved_formulae`
  - `id` (uuid, primary key, auto-generated)
  - `topic` (text, not null) — the topic name (e.g. "Thermodynamics")
  - `formulae` (jsonb, not null) — array of formula objects { name, expression, description }
  - `created_at` (timestamptz, default now())

## Security
- RLS enabled on `saved_formulae`.
- Grants: SELECT, INSERT, DELETE to `anon` and `authenticated`.
- Policies: all CRUD is public — intentionally shared data in a no-auth app.

## Notes
1. No `user_id` column — the app is single-tenant with no authentication.
2. Duplicate topics are allowed (each save creates a new row); the frontend
   deduplicates by topic name for display.
*/

CREATE TABLE IF NOT EXISTS saved_formulae (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  formulae jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_formulae ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON saved_formulae TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_saved_formulae" ON saved_formulae;
CREATE POLICY "anon_select_saved_formulae" ON saved_formulae FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saved_formulae" ON saved_formulae;
CREATE POLICY "anon_insert_saved_formulae" ON saved_formulae FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved_formulae" ON saved_formulae;
CREATE POLICY "anon_delete_saved_formulae" ON saved_formulae FOR DELETE
TO anon, authenticated USING (true);
