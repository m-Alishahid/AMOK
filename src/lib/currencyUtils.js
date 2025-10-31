// app/lib/currencyUtils.js
import CURRENCY_CONFIG, { CURRENCIES } from './currencyConfig';

// Main currency format function
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return CURRENCY_CONFIG.symbol + '0';
  return CURRENCY_CONFIG.format(amount);
};

// Number format without currency symbol
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined) return '0';
  return CURRENCY_CONFIG.formatWithoutSymbol(amount);
};

// Currency symbol separately (agar chahiye)
export const getCurrencySymbol = () => CURRENCY_CONFIG.symbol;

// Currency code
export const getCurrencyCode = () => CURRENCY_CONFIG.code;

// Change currency dynamically (agar aap currency switch karna chahein)
export const setCurrency = (currencyCode) => {
  const newCurrency = CURRENCIES[currencyCode];
  if (newCurrency) {
    // Yahan aap context ya localStorage mein save kar sakte hain
    localStorage.setItem('preferredCurrency', currencyCode);
    return newCurrency;
  }
  return CURRENCY_CONFIG;
};

// Get current currency
export const getCurrentCurrency = () => {
  const saved = localStorage.getItem('preferredCurrency');
  return saved ? CURRENCIES[saved] : CURRENCY_CONFIG;
};

// Short format for large amounts (e.g., 1.5K, 2.3M)
export const formatCurrencyShort = (amount) => {
  if (amount >= 1000000) {
    return CURRENCY_CONFIG.symbol + (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return CURRENCY_CONFIG.symbol + (amount / 1000).toFixed(1) + 'K';
  }
  return formatCurrency(amount);
};