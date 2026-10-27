# BandHub — assessment and first increment

The existing Bandroom web app is preserved in ../bandroom. It is a React/Vinext app with Cloudflare D1/R2, Sites identity, a single shared workspace, explicit text saves and five-second chat polling. Its 28 existing tests pass. It has no native app, band membership model, multi-band authorization, Supabase connection, realtime chat, microphone recording, or independent account registration. It is not safe to treat its shared tables as a multi-band backend.

Decision: add a separate Expo Router / TypeScript mobile application rather than replace the working web UI. Native device recording, secure credential storage and Android/iOS packaging justify this new client. The prior song editing and validation behavior provides regression guidance. The old data remains untouched; migrating it requires explicit band ownership mapping and is not automatic.

First increment: Supabase account flows, profiles, private band creation/switching, email-bound invite tokens, role enforcement, songs/ideas, append-only recording versions, lyrics/chords/tabs, private documents and realtime text discussions. A dark shared component system connects these workflows. Known-song lookup uses metadata and legitimate external source links; copyrighted content is not scraped.

Database migrations and RLS are tested in embedded PostgreSQL (PGlite) with authenticated roles and separate users. Missing credentials produce an honest setup state. Supabase hosted auth, Storage, Realtime and Android/iOS permissions still require deployment/device verification. Future increments add calendar, availability, setlists, tasks and venue integrations; advanced practice tools remain deferred.

Expo SDK 58 dependencies are selected from the published SDK's bundledNativeModules.json. See https://docs.expo.dev/router/installation/ and https://supabase.com/docs/guides/auth/quickstarts/react-native for supported integration patterns.
