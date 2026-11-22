const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

const withOAuthRedirect = (config) => {
  return withAndroidManifest(config, async (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      config.modResults
    );

    // Prevent duplicate insertion
    const alreadyExists = mainActivity['intent-filter']?.some((filter) =>
      filter?.data?.some(
        (d) => 
          d.$?.['android:scheme'] === 'com.googleusercontent.apps.1042109660708-pn4c4g5b4crjeqs906ehruj72u5ol1ot' ||
          d.$?.['android:scheme'] === 'com.ajugbo.driverradar'
      )
    );

    if (!alreadyExists) {
      const redirectFilter = {
        $: { 'android:autoVerify': 'true' },
        'action': [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        'category': [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        'data': [
          {
            // 1. The Reverse Client ID (REQUIRED for androidClientId to work)
            $: {
              'android:scheme': 'com.googleusercontent.apps.1042109660708-pn4c4g5b4crjeqs906ehruj72u5ol1ot',
              'android:host': 'oauthredirect',
            },
          },
          {
            // 2. Your custom scheme (kept as a backup)
            $: {
              'android:scheme': 'com.ajugbo.driverradar',
              'android:host': 'oauthredirect',
            },
          },
        ],
      };

      mainActivity['intent-filter'] = [
        ...(mainActivity['intent-filter'] || []),
        redirectFilter,
      ];
    }

    return config;
  });
};

module.exports = withOAuthRedirect;
