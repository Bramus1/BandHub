# Music crash fix — 0.2.1

The device capture BandHub-crash-20261023-150705.txt reports a React error at 15:07:07.964: cannot add postgres_changes callbacks after subscribe(), in Music. A native addViewAt crash follows immediately. Home and Music both mount useSongs for the same band. Supabase reuses channels with identical names, so the second screen attempted to register a listener on the already subscribed Home channel.

Fix: each useSongs effect gets a unique channel name, retaining its band filter and removing only its own channel on cleanup. No database or dependency changes. Android versionCode is 3, app version 0.2.1.

TDD (ECC tdd-workflow): tests/song-subscription.test.ts mounts the production hook twice with React and a Supabase adapter reproducing SDK channel reuse. RED reproduced the same callback-after-subscribe exception. GREEN verifies simultaneous subscriptions, cleanup isolation, continued change refresh and remounting. Full suite passed 51/51; TypeScript check passed. This is a hook-level regression test, not physical Android validation. Native addViewAt is likely secondary to the JS error; confirm resolution on the phone after installing the new APK. Full-app coverage threshold has not been established.

Release result: Expo build 146f54a6-202a-47d1-a3af-d86101cc1ddf FINISHED. BandHub-0.2.1.apk downloaded and AndroidManifest.xml/classes.dex verified in archive. SHA256 589715F9A9E13296A0C6D4BA0E068A7AA52771C82EE59181C14F541EB1CDC320. Install over existing app and verify Home-to-Music navigation on device.
