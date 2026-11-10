# Google Sign-In setup checklist

## Android OAuth client

In Google Cloud Console, create an OAuth client ID with application type
**Android** and use:

- **Package name:** `com.ajugbo.driverradar`
- **SHA-1 certificate fingerprint:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Custom URI scheme:** Enabled in the Expo app configuration as `driverradar`
  (`mobile/app.json`). The Android OAuth client is identified by its package
  name and signing-certificate SHA-1; the URI scheme is an app redirect setting,
  not an Android OAuth client field.

The supplied keystore path `/home/codespace/.android/debug.keystore` was not
present in this workspace. The fingerprint above was read from the existing
`mobile/android/app/debug.keystore`, which is ignored by Git and is not tracked.
The Android GitHub Actions workflow runs a clean Expo prebuild, so verify the
signing certificate of the actual CI-built APK before relying on this
fingerprint. If CI uses a different keystore, register that signing
certificate's SHA-1 as well.

## Web OAuth client

Create a separate OAuth client ID with application type **Web application**.
Use its client ID for backend ID-token audience verification; do not treat the
Android client ID as the backend audience.

Required OpenID Connect scopes:

- `openid`
- `email`
- `profile`

Keep the web client ID in the backend environment as
`GOOGLE_WEB_CLIENT_ID`. The Android client ID is
`GOOGLE_ANDROID_CLIENT_ID`.

## App redirect scheme

The Expo app currently declares the `driverradar` scheme in
`mobile/app.json`. Keep the registered redirect URI consistent with this scheme
if using a redirect-based auth flow. Native Android Google Sign-In client
registration itself uses the Android package name and SHA-1 above.

## Post-setup verification

1. Confirm the Android OAuth client in Google Cloud Console has package name
   `com.ajugbo.driverradar` and the SHA-1 for the certificate that signs the
   APK being tested.
2. Confirm the Web OAuth client ID is configured for backend verification and
   is the expected `aud` value for returned Google ID tokens.
3. Generate an ID token through the app and verify it on the backend with
   `google-auth-library` using `verifyIdToken({ idToken, audience:
   GOOGLE_WEB_CLIENT_ID })`. Check that the verified token is issued by Google,
   is not expired, and has the expected audience and email claims. Do not log
   or share the raw token.
4. For diagnosis only, Google's token-info endpoint can help inspect a test
   token's audience and expiry:
   `https://oauth2.googleapis.com/tokeninfo?id_token=<test-id-token>`.
   Do not use token-info as the production verification mechanism.
5. Inspect the built APK's package and signing certificate (for example with
   `apkanalyzer` and `apksigner verify --print-certs`) and compare them with
   the Android OAuth client configuration.
6. Test sign-in on an installed build and confirm the backend rejects invalid,
   expired, or wrong-audience tokens before issuing an application JWT.

## Dependency commands

Run from the mobile app directory after reviewing this preparation:

```sh
npx expo install @react-native-google-signin/google-signin expo-auth-session expo-web-browser
```

## Backend verification reference

No E-Marker implementation or source reference was found in this workspace.
Before implementing verification, compare the token-verification and account
linking policy with the intended E-Marker implementation. The existing Driver
Radar JWT helper is `issueToken` in `api/_lib/http.ts`, used by
`api/auth/login.ts` and `api/auth/register.ts`.
