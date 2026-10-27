# Collaboration update — source 0.2.0

Added on 23 October 2026. The installed 0.1.0 APK does not contain these features. No replacement APK is represented as ready or as fixing the reported Music-tab crash.

## Implemented

- `src/LayerRecorder.tsx`: choose a previous recording, preview it on loop, enter an instrument/part name, record with the guide playing, stop and upload a separate take. The original is retained. Filenames preserve the guide version (for example Bass over v3.m4a). Wired into the song/idea Recordings page.
- `app/(tabs)/calendar.tsx`: shared band agenda; create rehearsals, sessions and gigs with local date/time, duration and location; view and refresh events; confirm removal of own events (or any band event as admin/owner). UTC storage displays each device's local time.
- `app/venues.tsx`: town/area or near-me live-music venue search opens Google Maps. Booking availability must be confirmed with the venue. No automatic location collection, scraping or paid API integration.
- `src/planning.ts`: date/duration validation, safe map URL construction and part filenames.
- `supabase/migrations/202610230001_calendar.sql`: private calendar_events table and member/author policies. Applied to the BandHub Supabase project through the migration connector.

## Validation

Tests preceded the new domain/migration code: planning tests failed for the missing module, and the calendar security test failed because the calendar table did not exist. After implementation, 43 total tests passed and TypeScript passed. Tests validate dates, duration, venue URL encoding, part names, cross-band calendar isolation/author spoofing, and loop-recording startup order, denied microphone permission and playback failure cleanup. The loop-control tests also failed for a missing implementation before it was written.

## Limits and release gate

Audio is separate guide playback plus microphone recording, not a sample-aligned multitrack engine. Use headphones. There is no automatic latency correction, combined mix export or simultaneous playback of all bandmates' parts; a new part can use any single saved take as its guide. Guide looping is the entire recording. Native playback/recording concurrency, permission denial, interruption and upload retry still need device acceptance. Unsaved takes are lost if leaving the page; upload before navigating away.

Calendar is an agenda, without month grid, reminders, recurrence, event editing or availability voting. Refresh to see other members' changes. Venue results are external Maps results, not an in-app database of bookable shows.

The Music-tab crash remains open. Local mocked-native rendering checks passed, but no Android crash trace is available yet. Capture that trace, fix and regression-test its actual cause, then build/install an updated APK and test these workflows on a phone.
