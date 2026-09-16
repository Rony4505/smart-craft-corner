export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isGmailAddress(email: string): boolean {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}

export function maskEmail(email: string): string {
  return email.trim().replace(/(.{2}).+(@.+)/, "$1***$2");
}

export function recoveryEmailsMatch(saved: string | undefined, typed: string): boolean {
  const a = saved?.trim().toLowerCase() ?? "";
  const b = typed.trim().toLowerCase();
  return Boolean(a) && a === b;
}
