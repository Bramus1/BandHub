# Android APK build

The preview profile in eas.json generates a standalone APK with the BandHub Supabase URL and public client key embedded. No service-role key is included. The APK does not require Metro or Expo Go to run. It remains a test release until microphone, sign-in callbacks, uploads and chat have been checked on a phone.

This workspace has no Android SDK and cannot compile an APK locally yet. Expo EAS cloud build requires your Expo account login and an EAS project association. No APK has been generated at this stage.

From the bandhub directory, after installing Node/npm:

```powershell
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Use the Expo account you own. If asked to create the BandHub EAS project or generate its Android keystore, those are required for the first signed build. Keep the same signing credentials for future updates. Do not purchase build credits or upgrade a plan unless you choose to do so.

After a successful build, download its APK link on your Android phone and install it. Android may ask you to allow installation from the browser used for the download. This is an internal test release, not a Play Store listing.

Before testing confirmation/reset emails, add `bandhub://auth/callback` to the Supabase Auth redirect allowlist. Existing app schema and private storage are deployed. Phone acceptance testing remains pending.

Reference: https://docs.expo.dev/build-reference/apk/
