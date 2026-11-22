const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

const withOAuthRedirect = (config) => {
  return withAndroidManifest(config, async (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    const alreadyExists = mainActivity['intent-filter']?.some((filter) =>
      filter?.data?.some((d) => d.$?.['android:scheme'] === 'com.ajugbo.driverradar')
    );
    if (!alreadyExists) {
      mainActivity['intent-filter'] = [
        ...(mainActivity['intent-filter'] || []),
        {
          $: { 'android:autoVerify': 'true' },
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          category: [
            { $: { 'android:name': 'android.intent.category.DEFAULT' } },
            { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
          ],
          data: [{ $: { 'android:scheme': 'com.ajugbo.driverradar', 'android:host': 'oauthredirect' } }],
        },
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
    android: { package: 'com.ajugbo.driverradar' },
    plugins: [
      'expo-router',
      [
        '@react-native-google-signin/google-signin',
        {
          webClientId: '1042109660708-344vbt0keehimbl1m629it924pjtr9jo.apps.googleusercontent.com',
          androidClientId: '1042109660708-pn4c4g5b4crjeqs906ehruj72u5ol1ot.apps.googleusercontent.com',
          // Required by the plugin when not using Firebase, even for Android-only builds
          iosUrlScheme: 'com.googleusercontent.apps.1042109660708-pn4c4g5b4crjeqs906ehruj72u5ol1ot',
        },
      ],
      'expo-web-browser',
    ],
    experiments: { typedRoutes: true },
    web: { bundler: 'metro' },
  });
};
