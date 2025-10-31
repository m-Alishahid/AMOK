// app/hooks/useCurrency.js
import { useState } from 'react';
import { 
  formatCurrency, 
  formatNumber, 
  getCurrencySymbol, 
  setCurrency, 
  getCurrentCurrency,
  CURRENCIES 
} from '@/lib/currencyUtils';

export const useCurrency = () => {
  const [currentCurrency, setCurrentCurrency] = useState(getCurrentCurrency());

  const changeCurrency = (currencyCode) => {
    const newCurrency = setCurrency(currencyCode);
    setCurrentCurrency(newCurrency);
  };

  return {
    formatCurrency,
    formatNumber,
    getCurrencySymbol,
    currentCurrency,
    changeCurrency,
    availableCurrencies: CURRENCIES
  };
};