# Driver Radar Mobile

## Expo SDK compatibility

This app targets Expo SDK 57. Use Expo Go SDK 57 or a development build compiled for SDK 57. The `prestart` check verifies the local SDK declaration and the minimum Node.js version before the dev server starts.

Check the installed Expo CLI version with:

```sh
npx expo --version
```

When Expo Go updates to a newer SDK, upgrade this project from the `mobile` directory:

```sh
npx expo install --fix
npx expo-doctor
```

Review the migration output and test the landing page, neon colors, scanlines, API connections, and QR-code launch before committing the updated lockfile. Expo SDK upgrades are intentionally not pinned to an exact patch version; use the caret ranges in `package.json` and let Expo select compatible packages.

## Development

```sh
npm install
npm start
```
