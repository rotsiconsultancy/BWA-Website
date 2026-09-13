export const supportedCurrencies = ["KES", "USD"] as const;

export type StoreCurrency = (typeof supportedCurrencies)[number];
export type Prices = { KES: number; USD: number | null };

export const formatMoney = (amount: number, currency: StoreCurrency) =>
  new Intl.NumberFormat(currency === "KES" ? "en-KE" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: currency === "KES" ? 0 : 2,
    maximumFractionDigits: currency === "KES" ? 0 : 2,
  }).format(amount);

export const priceFor = (prices: Prices, currency: StoreCurrency) =>
  prices[currency];

export const deliveryFeeFor = (currency: StoreCurrency) =>
  currency === "KES" ? 250 : Number(process.env.STANDARD_DELIVERY_USD || "3");
