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

// Delivery is never added to the website total. Within Nairobi the customer
// pays the Uber/Bolt fare; outside Nairobi BWA confirms the cost on WhatsApp.
export const DELIVERY_NOTE =
  "Within Nairobi, delivery costs the Uber or Bolt fare to your door. Outside Nairobi, we confirm the cost with you on WhatsApp.";
