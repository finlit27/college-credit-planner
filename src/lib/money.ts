/**
 * Money formatting helpers. Always pair the rendered output with the
 * `tabular-nums` Tailwind utility on its container so digits align in columns.
 */

/** Format a number as USD, no cents. */
export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Parse "$12,345" or "12345.67" into a number. Returns 0 on junk. */
export function parseCurrency(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
