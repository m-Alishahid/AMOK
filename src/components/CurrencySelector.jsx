// app/components/CurrencySelector.jsx
"use client";
import { useCurrency } from '@/hooks/useCurrency';

export function CurrencySelector() {
  const { currentCurrency, changeCurrency, availableCurrencies } = useCurrency();

  return (
    <select 
      value={currentCurrency.code}
      onChange={(e) => changeCurrency(e.target.value)}
      className="text-sm border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {Object.entries(availableCurrencies).map(([code, currency]) => (
        <option key={code} value={code}>
          {currency.symbol} {currency.code}
        </option>
      ))}
    </select>
  );
}