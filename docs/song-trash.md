# Recoverable song deletion — 23 October 2026

Implemented in the next Android update (source version 0.2.0). The installed 0.1.0 APK does not contain these controls.

Open a song and choose **Move to trash**, then confirm. Save any text edits first. A song creator or a band owner/admin can do this. Trashed songs leave the active library. Open **Song trash** from Home or Music to restore them. Recordings, lyrics, tabs, documents and discussion remain stored; this does not free storage or permanently erase files.

Files: src/SongTrash.tsx, app/trash.tsx, app/song/[id].tsx, app/(tabs)/home.tsx, app/(tabs)/music.tsx, src/api.ts, src/types.ts, tests/security.test.ts.

Database: 202610230002_song_trash.sql was applied through the Supabase connector as song_trash. No user songs were changed. Verified remotely: anonymous execution false, authenticated execution true, direct deleted_at update false. Reconcile remote migration timestamps before using CLI migration deployment.

TDD evidence (ECC tdd-workflow): user journey is remove a song safely and restore it while preserving recordings and band permissions. Added integration test before implementation. RED: 12 passed, new test failed because set_song_trashed did not exist. GREEN: 13 database tests passed; full `node --import tsx --test tests/*.test.ts` passed 44/44. TypeScript `tsc --noEmit` passed. Android production bundle export succeeded.

The SQL integration test exercises creator/owner/admin permission, rejects an unrelated band and ordinary member, rejects direct flag modification and pre-trashed insertion, verifies active-library filtering, restoration and preservation of two recording versions. No permanent deletion path is provided.

Limitations: no physical Android UI test or full-app coverage measurement for this change; the skill's 80% full-app coverage target is not established. The reported Music-tab native crash is still unresolved and requires the device crash log. An updated APK must be built and installed to use the new controls. The exported bundle is not an APK.
