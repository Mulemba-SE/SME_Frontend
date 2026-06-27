// Shared formatting helpers. KES uses standard 3-digit grouping — en-KE
// (or en-US) gives "1,234,567"; en-IN gives "12,34,567" (lakh grouping),
// which is wrong for Kenyan Shillings even though the digits are the same.

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
