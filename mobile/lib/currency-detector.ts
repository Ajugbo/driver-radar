import { Platform } from 'react-native';

// Base price in USD
const BASE_PRICE_USD = 3.00;

// Approximate exchange rates for display purposes
// The actual payment gateway (Stripe/Paystack) will handle the real-time conversion.
const REGIONAL_PRICING: Record<string, { currency: string; symbol: string; rate: number }> = {
  NG: { currency: 'NGN', symbol: '₦', rate: 1666 }, // ~4,999 NGN
  US: { currency: 'USD', symbol: '$', rate: 1 },
  GB: { currency: 'GBP', symbol: '£', rate: 0.80 },
  EU: { currency: 'EUR', symbol: '€', rate: 0.93 },
  IN: { currency: 'INR', symbol: '₹', rate: 83 },
  ZA: { currency: 'ZAR', symbol: 'R', rate: 18 },
  GH: { currency: 'GHS', symbol: 'GH₵', rate: 15 },
};

export function getRegionalPricing() {
  // Try to get locale from device settings
  const locale = Platform.OS === 'ios' 
    ? require('react-native').NativeModules.SettingsManager.settings.AppleLocale 
    : require('react-native').NativeModules.I18nManager.localeIdentifier;

  const countryCode = locale ? locale.split('_')[1] || locale.split('-')[1] : 'US';
  const region = REGIONAL_PRICING[countryCode] || REGIONAL_PRICING['US'];

  const displayPrice = Math.round(BASE_PRICE_USD * region.rate);
  
  return {
    basePriceUSD: BASE_PRICE_USD,
    displayPrice: `${region.symbol}${displayPrice.toLocaleString()}`,
    currencyCode: region.currency,
    countryCode: countryCode,
  };
}
