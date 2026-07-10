import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customersApi } from "../../../api/customers";
import { invoicesApi } from "../../../api/invoices";
import { formatKES, formatDate } from "../../../lib/format";
import type { InvoiceListItem } from "../../../types/invoice";

// ── Avatar 

function getAvatarProps(name: string): { initials: string; bg: string; color: string } {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

  const palette = [
    { bg: "#EEF2FF", color: "#4F46E5" },
    { bg: "#FEF3C7", color: "#D97706" },
    { bg: "#DCFCE7", color: "#16A34A" },
    { bg: "#FCE7F3", color: "#DB2777" },
    { bg: "#E0F2FE", color: "#0284C7" },
    { bg: "#F3E8FF", color: "#9333EA" },
    { bg: "#FFF7ED", color: "#EA580C" },
    { bg: "#F0FDF4", color: "#15803D" },
  ];
  const idx =
    name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % palette.length;
  return { initials, ...palette[idx] };
}

function Avatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const { initials, bg, color } = getAvatarProps(name);
  const cls = size === "lg"
    ? "w-16 h-16 rounded-2xl text-xl font-bold flex-shrink-0"
    : "w-9 h-9 rounded-xl text-sm font-bold flex-shrink-0";
  return (
    <div className={`${cls} flex items-center justify-center`} style={{ background: bg, color }}>
      {initials}
    </div>
  );
}

// ── Status Badge 

type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

const STATUS_STYLES: Record<InvoiceStatus, { bg: string; text: string; dot: string; label: string }> = {
  paid:    { bg: "bg-green-50 border-green-100",  text: "text-green-700", dot: "bg-green-500", label: "Paid" },
  pending: { bg: "bg-amber-50 border-amber-100",  text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  overdue: { bg: "bg-red-50 border-red-100",      text: "text-red-600",   dot: "bg-red-400",   label: "Overdue" },
  draft:   { bg: "bg-gray-50 border-gray-200",    text: "text-gray-600",  dot: "bg-gray-400",   label: "Draft" },
};

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase();
  const s = STATUS_STYLES[normalizedStatus as InvoiceStatus] ?? {
    bg: "bg-gray-100 border-gray-200", text: "text-gray-500", dot: "bg-gray-400", label: status,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Detail Row 

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 font-medium min-w-[100px]">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

// ── Skeleton 

function Skeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-6" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-32 bg-gray-100 rounded-xl col-span-2" />
      </div>
    </div>
  );
}

// ── Error State 

function ErrorState({ userNo }: { userNo: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Customer not found</p>
      <p className="text-sm text-gray-500 mb-4">No customer with ID {userNo} could be found.</p>
      <Link
        to="/dashboard/customers"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Back to Customers
      </Link>
    </div>
  );
}

// ── Main Page 

export default function CustomerDetailPage() {
  const { userNo } = useParams<{ userNo: string }>();

  const customerId = Number(userNo);

  const { data: customerList, isLoading: isCustomerLoading, isError: isCustomerError } = useQuery({
    queryKey: ["customer", userNo],
    queryFn: async () => {
      const res = await customersApi.list({
        search: userNo,
        searchBy: "userNo",
        page: 1,
        limit: 1,
      });
      return res;
    },
    enabled: Boolean(userNo && !Number.isNaN(customerId)),
  });

  const { data: invoices = [], isLoading: isInvoicesLoading, isError: isInvoicesError } = useQuery({
    queryKey: ["customer-invoices", userNo],
    queryFn: async () => {
      if (!userNo || Number.isNaN(customerId)) return [] as InvoiceListItem[];
      return invoicesApi.list({
        customerNo: customerId,
        page: 1,
        limit: 100,
      });
    },
    enabled: Boolean(userNo && !Number.isNaN(customerId)),
  });

  const customer = customerList?.data?.[0] ?? null;
  const reconciledInvoices = (invoices ?? []).filter(
    (invoice) => Number(invoice.customerNo) === customerId
  );
  const latestInvoice = reconciledInvoices[0] ?? null;
  const totalInvoiceCount = reconciledInvoices.length;
  const totalInvoiceValue = reconciledInvoices.reduce((sum, invoice) => sum + Number(invoice.invoiceTotal ?? 0), 0);
  const totalAmountPaid = reconciledInvoices.reduce((sum, invoice) => sum + Number(invoice.amountPaid ?? 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiceValue - totalAmountPaid);

  const displayName = [latestInvoice?.firstName, latestInvoice?.lastName, customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(" ") || customer?.email || "—";

  const latestInvoiceNumber = latestInvoice?.invoiceNo != null
    ? `INV-${String(latestInvoice.invoiceNo).padStart(7, "0")}`
    : customer?.invoiceNo != null
      ? `INV-${String(customer.invoiceNo).padStart(7, "0")}`
      : "—";

  const latestInvoiceDate = latestInvoice?.dueDate ?? customer?.dueDate ?? null;
  const latestInvoiceStatus = latestInvoice?.status ?? customer?.status ?? "—";

  if (isCustomerLoading || isInvoicesLoading) return <Skeleton />;
  if (isCustomerError || isInvoicesError || customer === null) return <ErrorState userNo={userNo ?? ""} />;
  if (!customer) return <ErrorState userNo={userNo ?? ""} />;

  return (
    <div className="w-full">
      {/* ── Header Section with Profile ── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Avatar
                name={
                  [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email || "Customer"
                }
                size="sm"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {displayName}
                </h1>
                <span className="text-white text-sm font-medium mb-1 block">{customer.userNo}</span>
                <div className="flex items-center gap-2 text-white text-base">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 6 10 7 10-7" />
                  </svg>
                  <span>{customer.email}</span>
                  <span>•</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{customer.phoneNumber || "—"}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col items-end gap-2">
  <Link
    to={`/dashboard/invoices/new?customerNo=${customer.userNo}`}
    aria-label="Create invoice"
    title="Create invoice"
    className="inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
  >
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="12" x2="12" y2="18" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  </Link>
  <Link
    to="/dashboard/customers"
    className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
  >
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
    Back
  </Link>
</div>
 
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="px-6 mb-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-5 md:grid-cols-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Invoices</p>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            </div>
            <p className="text-1xl font-bold text-gray-900">{totalInvoiceCount}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Due</p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
            </div>
            <p className="text-1xl font-bold text-gray-900">
              {totalOutstanding > 0 ? formatKES(totalOutstanding) : "—"}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Invoice</p>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            </div>
            <p className="text-1xl font-bold text-gray-900">{latestInvoiceNumber}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Invoice Date</p>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <p className="text-1xl font-bold text-gray-900">
              {latestInvoiceDate ? formatDate(latestInvoiceDate) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Details Section ── */}
      <div className="px-6 pb-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div>
              <DetailRow label="Customer No." value={customer.userNo || "—"} />
              <DetailRow label="Name" value={displayName} />
              <DetailRow label="Email" value={customer.email || "—"} />
              <DetailRow label="Phone" value={customer.phoneNumber || "—"} />
            </div>
          </div>

          {/* Latest Invoice */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Latest Invoice</h2>
            <div>
              <DetailRow label="Invoice No." value={latestInvoiceNumber} />
              <DetailRow label="Due Date" value={latestInvoiceDate ? formatDate(latestInvoiceDate) : "—"} />
              <DetailRow
                label="Invoice Total"
                value={
                  <span className="text-gray-900 font-semibold">
                    {totalInvoiceValue > 0 ? formatKES(totalInvoiceValue) : "—"}
                  </span>
                }
              />
              <DetailRow
                label="Amount Paid"
                value={
                  <span className="text-gray-900 font-semibold">
                    {totalAmountPaid > 0 ? formatKES(totalAmountPaid) : "—"}
                  </span>
                }
              />
              <DetailRow
                label="Outstanding"
                value={
                  <span className="text-gray-900 font-semibold">
                    {totalOutstanding > 0 ? formatKES(totalOutstanding) : "—"}
                  </span>
                }
              />
              <DetailRow label="Payment Status" value={<StatusBadge status={latestInvoiceStatus} />} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
