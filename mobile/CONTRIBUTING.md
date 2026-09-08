# Contributing

## Dependency updates

Always run `npx expo install --fix` after pulling new code. Then run `npx expo-doctor` and resolve SDK compatibility warnings before testing changes.

For SDK upgrades, update the lockfile, run the mobile typecheck, and verify the landing page and cyberpunk UI in Expo Go or a matching development build.

CI should run `npx expo install --check` and `npx expo-doctor` so dependency drift is reported before native builds are published.
