export function formatCentsCompact(cents: number): string {
  const d = cents / 100;
  if (d < 1000)
    return d.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const k = d / 1000;
  if (k < 10) return `$${k.toFixed(3)}K`;
  if (k < 100) return `$${k.toFixed(2)}K`;
  return `$${k.toFixed(1)}K`;
}

export function formatUsdFromCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}