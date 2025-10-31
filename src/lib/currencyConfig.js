// app/lib/currencyConfig.js

// Currency Configuration - Yahan se change karein to pure app mein reflect hoga
export const CURRENCY_CONFIG = {
  symbol: '₨', // PKR ke liye
  code: 'PKR',
  name: 'Pakistani Rupee',
  locale: 'en-PK', // Pakistani locale for formatting
  decimalDigits: 2,
  
  // Formatting options
  format: (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
  
  // Simple format without currency symbol (agar chahiye)
  formatWithoutSymbol: (amount) => {
    return new Intl.NumberFormat('en-PK').format(amount);
  }
};

// Alternative currencies - easily switch karne ke liye
export const CURRENCIES = {
  PKR: {
    symbol: '₨',
    code: 'PKR',
    name: 'Pakistani Rupee',
    locale: 'en-PK',
    format: (amount) => new Intl.NumberFormat('en-PK').format(amount)
  },
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    locale: 'en-US',
    format: (amount) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    name: 'Indian Rupee',
    locale: 'en-IN',
    format: (amount) => new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    locale: 'en-EU',
    format: (amount) => new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }
};

// Default currency set karein
export default CURRENCY_CONFIG;