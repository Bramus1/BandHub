# Music tab crash investigation

User reports the installed Android 0.1.0 app closes immediately on opening Music, both before and after adding a song. Root cause is not established. No speculative production change has been made and no replacement APK has been submitted.

Actual Music component plus shared UI rendered with react-test-renderer and mocked native hosts/context/song data for: no band, empty band, one song, and search input in each state. All three checks passed (`work/music-render-check.cjs` in the parent workspace). These checks do not execute Android views, navigation transitions or live Supabase subscriptions and cannot rule out a native or asynchronous failure. Installed native package versions match Expo SDK 58's bundled version list.

Next evidence: Android process crash log. `outputs/Capture-BandHub-Crash.ps1` collects only the running com.bandhub.mobile PID while the user reproduces the problem, without clearing logs or changing app data. It needs Android platform-tools and one USB-debugging-authorized phone. Download platform-tools from Google's page and review/accept its license yourself: https://developer.android.com/tools/releases/platform-tools . Native crash reporters in separate processes may require additional diagnostics if this capture has no stack trace.
