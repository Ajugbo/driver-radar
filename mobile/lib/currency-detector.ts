import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'INR';

const CURRENCY_STORAGE_KEY = '@driver-radar/currency';
const regionCurrency: Record<string, Currency> = {
  NG: 'NGN',
  US: 'USD',
  GB: 'GBP',
  IN: 'INR',
};
const europeanRegions = new Set(['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK']);

function currencyForRegion(region: string | undefined): Currency | null {
  if (!region) return null;
  return regionCurrency[region] ?? (europeanRegions.has(region) ? 'EUR' : null);
}

function regionFromLocale(locale: string) {
  const parts = locale.replace('_', '-').split('-');
  return parts.find((part) => part.length === 2 && part === part.toUpperCase());
}

/** Detect locale currency first; add future regional mappings to regionCurrency above. */
export async function detectCurrency(): Promise<Currency> {
  const localeCurrency = currencyForRegion(regionFromLocale(Intl.NumberFormat().resolvedOptions().locale));
  if (localeCurrency) {
    await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, localeCurrency).catch(() => undefined);
    return localeCurrency;
  }

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? 'https://driver-radar.vercel.app'}/api/user/region`);
    const data = (await response.json()) as { countryCode?: string; region?: string };
    const serverCurrency = currencyForRegion(data.countryCode ?? data.region);
    if (serverCurrency) {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, serverCurrency).catch(() => undefined);
      return serverCurrency;
    }
  } catch {
    // Use the stored or default currency when region lookup is unavailable.
  }

  return (await AsyncStorage.getItem(CURRENCY_STORAGE_KEY).catch(() => null) as Currency | null) ?? 'NGN';
}

export function countryCodeForCurrency(currency: Currency) {
  return currency === 'NGN' ? 'NG' : currency === 'GBP' ? 'GB' : currency === 'INR' ? 'IN' : currency === 'EUR' ? 'DE' : 'US';
}

export function formatCurrency(amount: number, currency: Currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}