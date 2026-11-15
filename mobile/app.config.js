const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

// Define the plugin logic inline
const withOAuthRedirect = (config) => {
  return withAndroidManifest(config, async (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      config.modResults
    );

    // Prevent duplicate insertion
    const alreadyExists = mainActivity['intent-filter']?.some((filter) =>
      filter?.data?.some(
        (d) => d.$?.['android:scheme'] === 'com.ajugbo.driverradar'
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

module.exports = ({ config }) => {
  return withOAuthRedirect({
    ...config,
    name: 'Driver Radar',
    slug: 'driver-radar',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'driverradar',
    android: {
      package: 'com.ajugbo.driverradar',
    },
    plugins: [
      'expo-router',
      '@react-native-google-signin/google-signin',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
    },
    web: {
      bundler: 'metro',
    },
  });
};
