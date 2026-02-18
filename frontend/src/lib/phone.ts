/**
 * Strips all non-digit characters from a string.
 */
export function stripPhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formats a digit string as (XXX) XXX-XXXX as the user types.
 * Handles paste of full numbers, partial input, and any stored format.
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";
  const digits = stripPhone(value).slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
