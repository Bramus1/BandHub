# Verification evidence — 22 October 2026

ECC tdd-workflow was used for the domain, security, session, search and request-ordering logic. The earlier Bandroom app was left unchanged; its 28 tests passed during the initial audit. The new mobile increment has 36 passing tests. This is not a claim that all planned features or native user journeys are complete.

| Guarantee | Test file | RED evidence before implementation | GREEN evidence |
| --- | --- | --- | --- |
| Song/message/file validation, safe source links and configuration | domain.test.ts | Missing domain module failed the test run | Passing assertions |
| Unknown cover tempo remains unknown | domain.test.ts | Assertion failed: default 120 BPM instead of null | Cover uses null without supplied tempo |
| Band isolation, invitations, immutable versions, private paths and scoped comments | security.test.ts | Test failed reading the not-yet-created migration | Actual migration applied and policies exercised in PGlite |
| Secure session chunks and access state | session.test.ts | Missing implementation modules failed tests | Storage failure/Unicode/partial-read cases pass |
| Search normalization and provider errors | song-search.test.ts | Missing search module failed tests | Injected provider responses pass, including partial metadata and maintenance errors |
| Account changes and overlapping refreshes invalidate old responses | request-guard.test.ts | ERR_MODULE_NOT_FOUND for request-guard.ts, exit 1 | Both ordering assertions pass; guard connected to workspace auth/refresh |

The initial new-file failures were missing-implementation failures, not runtime assertions against a stub. The cover-tempo regression was an observed failing behavioral assertion. No Git repository was present, so RED/GREEN commits were not created. Additional provider edge cases were added after the initial search implementation; they pass and are not represented as an additional observed RED cycle.

## Commands and scope

- TypeScript: `tsc --noEmit` passed.
- Tests: `node --import tsx --experimental-test-coverage --test tests/*.test.ts` passed: **36 tests, 0 failed**. Raw result: `test-results.txt`.
- Measured imported pure modules: **96.51% lines, 94.17% branches, 100% functions**. Each of these modules exceeds 80% line/branch coverage. This is **not whole-app coverage**: React Native screens, client API wrappers and device features are not instrumented by this test run. SQL policy assertions run separately within the same suite and do not have line coverage. Full-app automated E2E coverage remains pending.
- Production export: Android and iOS Hermes bundles plus web JavaScript/assets exported successfully. This is not native compilation, signing, installation or store approval. The first exports failed due to sandbox temporary-directory permissions; redirecting TEMP/TMP into the workspace resolved the compiler file-write error.
- Browser smoke check: onboarding rendered without backend credentials; songbook navigation worked; empty song search was disabled; entering artist/title exposed provider links. A real Oasis/Wonderwall search returned the provider-busy message, leaving source links available. Successful live metadata retrieval was not observed. Setup navigation reached its route, but its rendered screen was not verified: the local preview became unreachable during the final check. `songbook-preview.png` records that state.

## Required acceptance run after backend setup

Use a fresh Supabase project and two confirmed accounts on Android and iOS. Verify sign-up, confirmation, sign-in, reset callback and sign-out. Create a band, invite the matching email, reject a different email and reused token, switch bands, and verify a nonmember cannot access private data/files. Exercise live chat on two devices and test reconnect/manual refresh.

Record, upload, seek, change speed, repeat, download and add timestamp comments; confirm new takes retain earlier versions. Deny microphone permission and retry. Test background/foreground audio and network interruption. Save lyrics/chords/tabs, export text, upload/download authorized PDFs and confirm files persist across relaunch. Verify removed members lose subsequent reads and signed URLs expire. Confirm the latest workspace cannot be replaced by an earlier account's delayed request.

These hosted/device steps have not been run because no Supabase project or physical-device session is configured. Draft recovery, member-management UI, scheduling and other deferred features are tracked in README.md; passing unit/SQL tests do not eliminate those limitations.
