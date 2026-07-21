import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../../../api/invoices";
import { getApiErrorMessage } from "../../../api/client";
import { useSendInvoiceConfirmation } from "../../../hooks/useInvoices";
import { usePayments } from "../../../hooks/usePayments";
import { StatCard } from "../../../components/ui/StatCard";
import { InvoiceStatusBadge as StatusBadge, PaymentStatusBadge } from "../../../components/ui/StatusBadge";
import { formatKES, formatDate } from "../../../lib/format";
import type { InvoiceDetail, InvoiceListItem } from "../../../types/invoice";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-medium text-right text-gray-900">{value}</span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 animate-pulse">
      <div className="h-28 rounded-2xl bg-gray-100" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="h-48 rounded-3xl bg-gray-100" />
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <svg width="24" height="24" fill="none" stroke="#dc2626" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Unable to load invoice</p>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      <Link
        to="/dashboard/invoices"
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Back to invoices
      </Link>
    </div>
  );
}


function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
        <svg width="20" height="20" fill="none" stroke="#9ca3af" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs">{message}</p>
    </div>
  );
}


type TimelineStepState = "done" | "pending";
type InvoiceDetailView = InvoiceListItem & { detail?: InvoiceDetail };

function TimelineStep({
  label,
  date,
  state,
  icon,
  isLast,
}: {
  label: string;
  date: string | null;
  state: TimelineStepState;
  icon: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center flex-1 last:flex-none">
      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
            state === "done" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-400"
          }`}
        >
          {icon}
        </div>
        <div className="text-center">
          <p className={`text-xs font-semibold ${state === "done" ? "text-gray-900" : "text-gray-400"}`}>{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{date ?? "—"}</p>
        </div>
      </div>
      {!isLast && <div className="flex-1 h-px border-t border-dashed border-gray-200 mx-2 mb-6" />}
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const invoiceNo = Number(id);
  const sendInvoiceConfirmation = useSendInvoiceConfirmation();

  const { data: invoice, isLoading, isError, error } = useQuery<InvoiceDetailView | null, Error>({
    queryKey: ["invoice-detail", invoiceNo],
    queryFn: async () => {
      if (!id || Number.isNaN(invoiceNo) || invoiceNo <= 0) {
        throw new Error("Invalid invoice number.");
      }

      const values = await invoicesApi.list({ invoiceNo, page: 1, limit: 1 });
      const summary = values[0];
      if (!summary) return null;
      if (summary.invoiceNo == null || summary.customerNo == null) return summary;

      const detail = await invoicesApi.detail({
        invoiceNo: summary.invoiceNo,
        customerNo: summary.customerNo,
      });
      
      return {
        ...summary,
        status: detail.status || summary.status,
        dueDate: detail.dueDate ?? summary.dueDate,
        amountPaid: detail.amount_paid,
        invoiceTotal: detail.total,
        detail,
      };
    },
    enabled: Boolean(id),
  });

 const [isSending, setIsSending] = useState(false);

const handleSendInvoiceConfirmation = async () => {
  if (!invoice?.invoiceNo) return;
  if (invoice.status?.toLowerCase() !== "draft") return;
  if (isSending) return;

  setIsSending(true);
  try {
    await sendInvoiceConfirmation.mutateAsync(invoice.invoiceNo);
  } catch (error) {
    console.error(error);
    
  } finally {
    setIsSending(false);
  }
};
  
  const invoiceTotal = invoice?.invoiceTotal ?? 0;
  const amountPaid = invoice?.amountPaid ?? 0;
  const outstanding = Math.max(0, invoiceTotal - amountPaid);
  const invoiceItems = invoice?.detail?.items ?? [];
  const totalTax = invoice?.detail?.total_tax ?? invoiceItems.reduce((sum, item) => sum + item.tax_total, 0);

  const customerName = useMemo(
    () => [invoice?.firstName, invoice?.lastName].filter(Boolean).join(" ") || "—",
    [invoice]
  );

  const daysRemaining = useMemo(() => {
    if (!invoice?.dueDate) return null;
    const due = new Date(invoice.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [invoice?.dueDate]);

  const {
    data: payments,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
  } = usePayments({ invoiceNo, page: 1, limit: 20 });

const isSentDone = Boolean(invoice?.status && invoice.status.toLowerCase() !== "draft");
const isPendingDone = Boolean(
  invoice?.status && ["pending", "overdue", "paid"].includes(invoice.status.toLowerCase())
);
const isPaidDone = invoice?.status?.toLowerCase() === "paid";

const paidDate = useMemo(() => {
  if (!isPaidDone || !payments || payments.length === 0) return null;
  const latest = payments.reduce((latest, p) =>
    new Date(p.paymentAt).getTime() > new Date(latest.paymentAt).getTime() ? p : latest
  );
  return latest.paymentAt;
}, [isPaidDone, payments]);


  if (isLoading) return <TableSkeleton />;

  if (isError || !invoice) {
    
    return <InlineError message={getApiErrorMessage(error, "Invoice not found. Please check the number and try again.")} />;
  }

  const invoiceLabel = `INV-${String(invoice.invoiceNo).padStart(7, "0")}`;
  console.log("invoice.status:", invoice.status);
  const recordPaymentHref =
    invoice.invoiceNo != null && invoice.customerNo != null
      ? `/dashboard/payments/new?invoiceNo=${invoice.invoiceNo}&customerNo=${invoice.customerNo}&amount=${outstanding || ""}`
      : "/dashboard/payments/new";

  return (
    <div className="w-full pb-10">
      {/* ── Header (REAL: invoiceNo, status, dates) ── */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-white">
            <h1 className="text-2xl font-bold tracking-wide">{invoiceLabel}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={invoice.status} size="xs" />
              <span className="text-sm text-blue-100">
                Created on {invoice.createdAt ? formatDate(invoice.createdAt) : "—"}
                {invoice.dueDate ? ` • Due on ${formatDate(invoice.dueDate)}` : ""}
              </span>
              {daysRemaining !== null && (
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                    daysRemaining < 0
                      ? "bg-red-100 text-red-700"
                      : daysRemaining <= 3
                      ? "bg-amber-100 text-amber-700"
                      : "bg-white/90 text-blue-700"
                  }`}
                >
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : daysRemaining === 0
                    ? "Due today"
                    : `${daysRemaining} days remaining`}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link
              to="/dashboard/invoices"
              className="order-last inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
             <Link
              to={isPaidDone ? "#" : recordPaymentHref}
              aria-label="Record payment"
              title={isPaidDone ? "Invoice is already fully paid" : "Record payment"}
              onClick={(e) => { if (isPaidDone) e.preventDefault(); }}
              aria-disabled={isPaidDone}
              className={`inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition-colors ${
                isPaidDone ? "cursor-not-allowed opacity-50" : "hover:bg-white/20"
              }`}
            >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18" />
                  <path d="M7 15h3" />
                </svg>
              </Link>
              <button
                type="button"
                disabled
                title="Coming soon"
                aria-label="Edit invoice"
                className="inline-flex h-9 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white opacity-70"
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </button>
              <button
                type="button"
                disabled={invoice.status?.toLowerCase() !== "draft" || isSending}
                onClick={handleSendInvoiceConfirmation}
                title={invoice.status?.toLowerCase() === "draft" 
                  ? "Send invoice confirmation" 
                  : "Invoice has already been sent"}
                className={`inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition-colors ${
                  (invoice.status?.toLowerCase() !== "draft" || isSending) 
                    ? "cursor-not-allowed opacity-50" 
                    : "hover:bg-white/20"
                }`}
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M22 2 11 13" />
                    <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="max-w-6xl mx-auto space-y-6">
         
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              label="Customer"
              value={customerName}
              iconBg="#EEF2FF"
              icon={
                <svg width="18" height="18" fill="none" stroke="#4F46E5" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <StatCard
              label="Invoice Total"
              value={formatKES(invoiceTotal)}
              iconBg="#F0FDF4"
              icon={
                <svg width="18" height="18" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
            />
            <StatCard
              label="Amount Paid"
              value={formatKES(amountPaid)}
              iconBg="#FCE7F3"
              icon={
                <svg width="18" height="18" fill="none" stroke="#DB2777" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              }
            />
            <StatCard
              label="Outstanding"
              value={formatKES(outstanding)}
              iconBg="#FEF3C7"
              icon={
                <svg width="18" height="18" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
          </div>

          {/* ── Invoice Items (PLACEHOLDER: no items on GET /invoices) ── */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Invoice Items</h2>
              {invoiceItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        <th className="py-3 pr-4">Item</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Qty</th>
                        <th className="py-3 px-4 text-right">Tax</th>
                        <th className="py-3 pl-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoiceItems.map((item, index) => (
                        <tr key={`${item.itemName}-${index}`}>
                          <td className="py-4 pr-4 text-sm font-semibold text-gray-900">{item.itemName || "Untitled item"}</td>
                          <td className="py-4 px-4 text-right text-sm text-gray-600">{formatKES(item.unitPrice)}</td>
                          <td className="py-4 px-4 text-right text-sm text-gray-600">{item.quantity}</td>
                          <td className="py-4 px-4 text-right text-sm text-gray-600">{formatKES(item.tax_total)}</td>
                          <td className="py-4 pl-4 text-right text-sm font-semibold text-gray-900">{formatKES(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No line items found"
                  message="This invoice loaded successfully, but no item rows were returned."
                />
              )}
              <div className="border-t border-gray-100 pt-4 mt-2 flex justify-end">
                <div className="w-full max-w-xs space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-semibold text-gray-900">{formatKES(totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invoice Total</span>
                    <span className="font-bold text-gray-900">{formatKES(invoiceTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Payment Summary (REAL) ── */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Summary</h2>
              <div>
                <DetailRow label="Invoice Total" value={formatKES(invoiceTotal)} />
                <DetailRow label="Amount Paid" value={<span className="text-green-600">{formatKES(amountPaid)}</span>} />
                <DetailRow label="Outstanding" value={<span className="text-red-600">{formatKES(outstanding)}</span>} />
                <DetailRow label="Invoice Status" value={<StatusBadge status={invoice.status} />} />
              </div>
            </div>

            {/* ── Payment History (REAL: GET /payments?invoiceNo=) ── */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment History</h2>
              {isPaymentsLoading ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : isPaymentsError ? (
                <p className="text-sm text-gray-400 py-6 text-center">Unable to load payment history.</p>
              ) : payments && payments.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <div key={p.paymentNo} className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Amount Paid</p>
                        <p className="text-sm font-semibold text-gray-900">{formatKES(p.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Paid Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(p.paymentAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Reference</p>
                        <p className="text-sm font-medium text-gray-900">{p.transactionRef || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Payment Status</p>
                        <PaymentStatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No payments recorded yet"
                  message="Payments made against this invoice will appear here."
                />
              )}
            </div>
          </div>

          {/* ── Invoice Timeline (PLACEHOLDER: only "Created" is real) ── */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Invoice Timeline</h2>
            <div className="flex items-start">
  <TimelineStep
    label="Created"
    date={invoice.createdAt ? formatDate(invoice.createdAt) : "—"}
    state="done"
    icon={
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    }
  />
 <TimelineStep
  label="Sent"
  date={null}
  state={isSentDone ? "done" : "pending"}
  icon={
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7 10-7" />
    </svg>
  }
/>
<TimelineStep
  label="Pending"
  date={null}
  state={isPendingDone ? "done" : "pending"}
  icon={
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  }
/>
<TimelineStep
  label="Paid"
  date={paidDate ? formatDate(paidDate) : null}
  state={isPaidDone ? "done" : "pending"}
  isLast
  icon={
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  }
/>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}
