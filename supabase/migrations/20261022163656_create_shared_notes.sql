/*
# Create shared_notes table for community note sharing

## Purpose
Stores notes that users publish to the "Browse Notes" community section.
Since the app has no sign-in, all notes are intentionally public — any
visitor can browse, upload, and view shared notes.

## New Tables
- `shared_notes`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — user-provided note title
  - `author` (text, not null) — display name the uploader provides
  - `subject` (text, not null) — category/tag for the note (e.g. "Math", "Physics")
  - `pages` (jsonb, not null) — array of page objects, each with `id` and `imageData` (base64 PNG data URL)
  - `created_at` (timestamptz, default now())

## Security
- RLS enabled on `shared_notes`.
- Grants: SELECT, INSERT, DELETE to `anon` and `authenticated` (no UPDATE —
  notes are immutable once shared; delete and re-upload instead).
- Policies: all CRUD is public (`USING (true)` / `WITH CHECK (true)`) because
  this table is intentionally shared community data in a no-auth app.

## Notes
1. The `pages` column stores the full canvas data (base64 PNG per page).
   This can be large; if it exceeds column limits in the future, consider
   Supabase Storage instead.
2. No `user_id` column — the app is single-tenant with no authentication.
*/

CREATE TABLE IF NOT EXISTS shared_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  pages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON shared_notes TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_shared_notes" ON shared_notes;
CREATE POLICY "anon_select_shared_notes" ON shared_notes FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shared_notes" ON shared_notes;
CREATE POLICY "anon_insert_shared_notes" ON shared_notes FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shared_notes" ON shared_notes;
CREATE POLICY "anon_delete_shared_notes" ON shared_notes FOR DELETE
TO anon, authenticated USING (true);
