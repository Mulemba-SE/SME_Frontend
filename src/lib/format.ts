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

// Date-range helpers. Previously duplicated in InvoicesOverviewChart,
// PaymentsOverviewCard, TopCustomersCard and ReportsPage.

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function firstOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

// Short "Jan 05" style date, used for chart axis ticks. Distinct from
// formatDate() above (which includes the year) — used specifically where
// space is tight.
export function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}
