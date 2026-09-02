/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#071016',
    tint: '#00c9d8',
    background: '#f1f8fa',
    foreground: '#071016',
    card: '#ffffff',
    cardForeground: '#071016',
    primary: '#00a9b8',
    primaryForeground: '#031014',
    secondary: '#d9edf0',
    secondaryForeground: '#12414a',
    muted: '#e4f1f3',
    mutedForeground: '#537278',
    accent: '#bceff3',
    accentForeground: '#07333b',
    destructive: '#e84e68',
    destructiveForeground: '#ffffff',
    border: '#b7d9dd',
    input: '#cae4e7',
    cyan: '#00a9b8',
    blue: '#2d77ff',
    amber: '#f5a623',
    success: '#14d99a',
    red: '#f35a6f',
    deep: '#dcecef',
    raised: '#ffffff',
    overlay: 'rgba(7, 16, 22, 0.64)',
  },
  dark: {
    text: '#e5fcff',
    tint: '#00f3ff',
    background: '#05080b',
    foreground: '#e5fcff',
    card: '#0c1419',
    cardForeground: '#e5fcff',
    primary: '#00f3ff',
    primaryForeground: '#031014',
    secondary: '#10252b',
    secondaryForeground: '#a5e8ed',
    muted: '#112127',
    mutedForeground: '#78979d',
    accent: '#113840',
    accentForeground: '#b7f5f8',
    destructive: '#ff4d67',
    destructiveForeground: '#ffffff',
    border: '#1b3a42',
    input: '#1b3a42',
    cyan: '#00f3ff',
    blue: '#3e84ff',
    amber: '#ffb72f',
    success: '#27e7a2',
    red: '#ff4d67',
    deep: '#071116',
    raised: '#101d23',
    overlay: 'rgba(0, 0, 0, 0.72)',
  },
  radius: 14,
};

export default colors;
