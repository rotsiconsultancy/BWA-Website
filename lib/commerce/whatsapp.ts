/** Turn a phone number as customers type it into wa.me digits (Kenya default). */
export function toWhatsAppNumber(phone: string | null | undefined) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  // 07XX… / 01XX… local format, or 7XX… with the leading zero dropped.
  if (/^0[17]\d{8}$/.test(digits)) digits = "254" + digits.slice(1);
  else if (/^[17]\d{8}$/.test(digits)) digits = "254" + digits;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

export function whatsAppLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
