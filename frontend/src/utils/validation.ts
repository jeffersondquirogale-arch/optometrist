/** Returns true if the value is a valid email address format. */
export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/** Returns true if the value is a valid date string that is not in the future. */
export function isValidPastOrPresentDate(v: string): boolean {
  if (!v) return true;
  const d = new Date(v);
  return !isNaN(d.getTime()) && d <= new Date();
}
