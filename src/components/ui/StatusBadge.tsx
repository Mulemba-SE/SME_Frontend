export type BadgeSize = "xs" | "sm" | "md";

interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
  label: string;
}

const INVOICE_STATUS_STYLES: Record<string, StatusStyle> = {
  draft: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", dot: "bg-gray-400", label: "Draft" },
  sent: { bg: "bg-blue-50 border-blue-100", text: "text-blue-700", dot: "bg-blue-500", label: "Sent" },
  pending: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  overdue: { bg: "bg-red-50 border-red-100", text: "text-red-600", dot: "bg-red-400", label: "Overdue" },
  paid: { bg: "bg-green-50 border-green-100", text: "text-green-700", dot: "bg-green-500", label: "Paid" },
};

const PAYMENT_STATUS_STYLES: Record<string, StatusStyle> = {
  pending: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  confirmed: { bg: "bg-green-50 border-green-100", text: "text-green-700", dot: "bg-green-500", label: "Confirmed" },
  failed: { bg: "bg-red-50 border-red-100", text: "text-red-600", dot: "bg-red-400", label: "Failed" },
};

const DEFAULT_STYLE: Omit<StatusStyle, "label"> = {
  bg: "bg-gray-100 border-gray-200",
  text: "text-gray-500",
  dot: "bg-gray-400",
};

const SIZE_CLASSES: Record<BadgeSize, { badge: string; dot: string }> = {
  xs: { badge: "gap-1 px-1.5 py-0.5 text-[10px]", dot: "w-1 h-1" },
  sm: { badge: "gap-1.5 px-2.5 py-1 text-xs", dot: "w-1.5 h-1.5" },
  md: { badge: "gap-1.5 px-3 py-1.5 text-sm", dot: "w-2 h-2" },
};

function Badge({ style, size }: { style: StatusStyle; size: BadgeSize }) {
  const sizeClasses = SIZE_CLASSES[size];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${sizeClasses.badge} ${style.bg} ${style.text}`}
    >
      <span className={`rounded-full ${sizeClasses.dot} ${style.dot}`} />
      {style.label}
    </span>
  );
}

function resolveStyle(map: Record<string, StatusStyle>, status: string): StatusStyle {
  const key = status?.toLowerCase?.() ?? "";
  return map[key] ?? { ...DEFAULT_STYLE, label: status || "—" };
}

export function InvoiceStatusBadge({ status, size = "sm" }: { status: string; size?: BadgeSize }) {
  return <Badge style={resolveStyle(INVOICE_STATUS_STYLES, status)} size={size} />;
}

export function PaymentStatusBadge({ status, size = "sm" }: { status: string; size?: BadgeSize }) {
  return <Badge style={resolveStyle(PAYMENT_STATUS_STYLES, status)} size={size} />;
}
