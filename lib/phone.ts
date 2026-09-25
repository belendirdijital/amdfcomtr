/** Digits only for comparison / synthetic auth email. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return digits.length >= 10 && digits.length <= 15;
}

/** Supabase password auth still needs an email; map phone → synthetic address. */
export function phoneToAuthEmail(phone: string): string {
  return `${normalizePhone(phone)}@phone.amdf.local`;
}

export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}
