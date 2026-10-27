# Tab layout and in-app sheets — 23 October 2026

Next APK source update: Add bar to the right extends the final complete six-string system, retaining notes and headings. Start a new six-string row creates another system below. Invalid or incomplete systems are preserved, with a new system appended. Monospaced horizontal editing keeps notation aligned. A technique legend is included.

Songbook now searches LRCLIB and displays plain lyrics within BandHub, with explicit saving to a band cover. External app buttons have been removed from this screen. Paste a song sheet preserves tuning, capo, key, chords and ASCII tabs as text in the song tabs field. These metadata are not parsed into separate properties. Existing songs remain unchanged. No database migration is needed.

Automatic complete chord/tab sheet retrieval remains unavailable. No suitable provider integration has been established. LRCLIB only supplies lyrics; it does not supply tabs or musical key/capo. Missing information is not invented. User-pasted sheets are supported. Provider API access is not a guarantee of redistribution rights for every record.

Provider documentation: https://lrclib.net/docs . Requests identify BandHub, encode queries, have a 15-second timeout, and observe Retry-After. Live content search was not exercised from the Android device; provider behavior is covered with mocked HTTP responses.

TDD: tests/tablature.test.ts and tests/sheet-search.test.ts were added first. RED: both failed on missing implementation modules. GREEN: 50/50 tests passed with node --import tsx --test tests/*.test.ts. TypeScript tsc --noEmit passed. No full-app coverage threshold or physical-device UI pass is claimed. Native Music crash remains unresolved.

Source files: src/tablature.ts, src/TabEditor.tsx, src/sheet-search.ts, src/api.ts, app/songbook.tsx, app/song/[id].tsx and the two tests. No new APK was built in this change.
