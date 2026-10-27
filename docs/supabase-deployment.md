# Supabase migration applied

Applied on 22 October 2026 to BandHub (`yenfkjaaqtqejdpabtnf`). Before migration, public tables, storage buckets and migration history were empty.

Source: `supabase/migrations/202610220001_core.sql`.
Remote migration recorded by Supabase: `20261022131945_bandhub_core`.

Verified after successful application:
- Nine public tables, all with row-level security enabled.
- Seventeen public access policies.
- Private `band-files` bucket with 26,214,400-byte upload limit and three storage policies.
- Realtime publication includes comments, memberships, messages, recordings and songs.

Do not execute the original migration again on this project. The connector assigned a different migration version from the local filename. Before adopting Supabase CLI/GitHub automatic deployment, reconcile this version with remote migration history (or rename the local migration and update its test/document references). No GitHub changes or automatic deployment configuration were made during this operation.

This verifies deployed schema/configuration, not a two-account phone acceptance test. App public environment variables and authentication redirect configuration still need to be connected and verified.

A second migration, `20261022132047_restrict_anonymous_function_execution`, removes direct default anon EXECUTE grants. The matching local follow-up SQL is `202610220002_restrict_anonymous_function_execution.sql` (with a conditional guard for the platform event trigger on fresh test databases). Verified zero anonymous-callable SECURITY DEFINER functions and eight intentionally authenticated app functions. Supabase's remaining advisory describes this intentional authenticated access: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable . Membership/role checks remain inside these functions.
