import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { usePaymentDetail, useConfirmPayment, useFailPayment } from "../../../hooks/usePayments";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../api/client";
import { StatCard } from "../../../components/ui/StatCard";
import { PaymentStatusBadge as StatusBadge, InvoiceStatusBadge } from "../../../components/ui/StatusBadge";
import { MethodBadge } from "../../../components/ui/MethodBadge";
import { formatKES, formatDate } from "../../../lib/format";


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
      <p className="text-sm font-semibold text-gray-900 mb-1">Unable to load payment</p>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      <Link
        to="/dashboard/payments"
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Back to payments
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

type TimelineStepState = "done" | "active" | "failed" | "pending";

function VerticalStep({
  label,
  sublabel,
  state,
  isLast,
}: {
  label: string;
  sublabel: string;
  state: TimelineStepState;
  isLast?: boolean;
}) {
  const circleClasses =
    state === "done"
      ? "bg-blue-600 border-blue-600"
      : state === "active"
      ? "bg-white border-amber-400"
      : state === "failed"
      ? "bg-red-600 border-red-600"
      : "bg-white border-gray-200";
  const lineClasses = state === "done" ? "bg-blue-600" : state === "failed" ? "bg-red-600" : "bg-gray-200";
  const labelClasses = state === "pending" ? "text-gray-400" : "text-gray-900";
  const sublabelClasses =
    state === "active" ? "text-amber-600" : state === "failed" ? "text-red-500" : "text-gray-400";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`mt-0.5 w-3 h-3 shrink-0 rounded-full border-2 ${circleClasses}`}>
          {state === "active" && <span className="block w-1.5 h-1.5 m-auto rounded-full bg-amber-400" />}
        </span>
        {!isLast && <span className={`w-px flex-1 my-1 ${lineClasses}`} />}
      </div>
      <div className={`pb-6 last:pb-0`}>
        <p className={`text-sm font-semibold ${labelClasses}`}>{label}</p>
        <p className={`text-xs mt-0.5 ${sublabelClasses}`}>{sublabel}</p>
      </div>
    </div>
  );
}

export default function PaymentDetailPage() {
  const { paymentNo: paymentNoParam } = useParams<{ paymentNo: string }>();
  const paymentNo = Number(paymentNoParam);
  const { user } = useAuth();
  const isManager = Boolean(user?.roles?.includes("MANAGER"));

  const { data: payment, isLoading, isError, error } = usePaymentDetail(paymentNo);

  const confirmPayment = useConfirmPayment();
  const failPayment = useFailPayment();
  const isActioning = confirmPayment.isPending || failPayment.isPending;

  const customerName = useMemo(
    () => [payment?.firstName, payment?.lastName].filter(Boolean).join(" ") || "—",
    [payment]
  );

  if (isLoading) return <TableSkeleton />;

  if (isError || !payment) {
    return <InlineError message={getApiErrorMessage(error, "Payment not found. Please check the number and try again.")} />;
  }

  const paymentLabel = `PAY-${String(payment.paymentNo).padStart(6, "0")}`;
  const invoiceLabel = `INV-${String(payment.invoiceNo).padStart(7, "0")}`;

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-white">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-wide">{paymentLabel}</h1>
              <StatusBadge status={payment.status} size="xs" />
            </div>
            <p className="text-sm text-blue-100 mt-2">
              Payment for Invoice{" "}
              <Link to={`/dashboard/invoices/${payment.invoiceNo}`} className="font-medium text-white hover:underline">
                {invoiceLabel}
              </Link>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-blue-100">
              <span>
                Recorded on {payment.createdAt ? formatDate(payment.createdAt) : formatDate(payment.paymentAt)}
              </span>
              <span className="opacity-60">•</span>
              <span className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold bg-white/90 text-blue-700">
                {payment.paymentMethod}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex items-center gap-2">
              {isManager && payment.status === "pending" && (
                <>
                  <button
                    type="button"
                    disabled={isActioning}
                    onClick={() => confirmPayment.mutate(payment.paymentNo)}
                    aria-label="Confirm payment"
                    title="Confirm payment"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/60 bg-emerald-500/90 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={isActioning}
                    onClick={() => failPayment.mutate(payment.paymentNo)}
                    aria-label="Mark payment as failed"
                    title="Mark as failed"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-300/60 bg-red-500/90 text-white transition-colors hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </>
              )}
              <button
                type="button"
                aria-label="Download receipt"
                title="Download receipt"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
              </button>
            </div>
            <Link
              to="/dashboard/payments"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Back
            </Link>
            {(confirmPayment.isError || failPayment.isError) && (
              <p className="text-xs text-red-100 bg-red-500/20 rounded-lg px-3 py-1.5">
                {getApiErrorMessage(confirmPayment.error ?? failPayment.error, "Couldn't update payment status.")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              label="Amount Paid"
              value={formatKES(payment.amount)}
              iconBg="#F0FDF4"
              icon={
                <svg width="18" height="18" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              }
            />
            <StatCard
              label="Payment Date"
              value={formatDate(payment.paymentAt)}
              iconBg="#EEF2FF"
              icon={
                <svg width="18" height="18" fill="none" stroke="#4F46E5" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              }
            />
            <StatCard
              label="Payment Method"
              value={payment.paymentMethod}
              iconBg="#FCE7F3"
              icon={
                <svg width="18" height="18" fill="none" stroke="#DB2777" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              }
            />
            <StatCard
            label="Status"
            value={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            iconBg={
              payment.status === "confirmed" ? "#ECFDF5" : payment.status === "failed" ? "#FEE2E2" : "#FEF3C7"
            }
            icon={
              payment.status === "confirmed" ? (
                <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="8 12 11 15 16 9" />
                </svg>
              ) : payment.status === "failed" ? (
                <svg width="18" height="18" fill="none" stroke="#DC2626" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )
            }
          />
    
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Information */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h2>
              <div>
                <DetailRow
                  label="Invoice"
                  value={
                    <Link to={`/dashboard/invoices/${payment.invoiceNo}`} className="text-blue-600 hover:underline">
                      {invoiceLabel}
                    </Link>
                  }
                />
                <DetailRow label="Payment Date" value={formatDate(payment.paymentAt)} />
                <DetailRow label="Amount Paid" value={formatKES(payment.amount)} />
                <DetailRow label="Payment Method" value={<MethodBadge method={payment.paymentMethod} />} />
                <DetailRow label="Reference" value={payment.transactionRef || "—"} />
                <DetailRow label="Payment Status" value={<StatusBadge status={payment.status} size="sm" />} />
                <DetailRow
                  label="Recorded On"
                  value={payment.createdAt ? formatDate(payment.createdAt) : "—"}
                />
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
              <div>
                <DetailRow label="Customer No" value={payment.customerNo} />
                <DetailRow label="Customer Name" value={customerName} />
                <DetailRow label="Email" value={payment.email || "—"} />
                <DetailRow label="Phone" value={payment.phoneNumber || "—"} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Related Invoice */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Related Invoice</h2>
              <div>
                <DetailRow
                  label="Invoice Number"
                  value={
                    <Link to={`/dashboard/invoices/${payment.invoiceNo}`} className="text-blue-600 hover:underline">
                      {invoiceLabel}
                    </Link>
                  }
                />
                <DetailRow label="Status" value={<InvoiceStatusBadge status={payment.invoiceStatus} />} />
                <DetailRow
                  label="Invoice Date"
                  value={payment.invoiceCreatedAt ? formatDate(payment.invoiceCreatedAt) : "—"}
                />
                <DetailRow label="Due Date" value={payment.invoiceDueDate ? formatDate(payment.invoiceDueDate) : "—"} />
                <DetailRow label="Invoice Total" value={formatKES(payment.invoiceTotal)} />
                <DetailRow
                  label="Balance Due"
                  value={
                    <span className={payment.invoiceBalance > 0 ? "text-red-600" : "text-green-600"}>
                      {formatKES(payment.invoiceBalance)}
                    </span>
                  }
                />
              </div>
              <Link
                to={`/dashboard/invoices/${payment.invoiceNo}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                View Invoice
              </Link>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
               
              </div>
              {payment.notes ? (
                <p className="text-sm text-gray-700">{payment.notes}</p>
              ) : (
                <EmptyState title="No notes added" message="Nothing was noted for this payment." />
              )}
            </div>
          </div>

          {/* Payment Progress */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Progress</h2>
            <div className="flex flex-col sm:flex-row sm:gap-8">
              {payment.status === "failed" ? (
                <>
                  <div className="sm:flex-1">
                    <VerticalStep
                      label="Recorded"
                      sublabel={payment.createdAt ? formatDate(payment.createdAt) : formatDate(payment.paymentAt)}
                      state="done"
                      isLast
                    />
                  </div>
                  <div className="sm:flex-1">
                    <VerticalStep
                      label="Failed"
                      sublabel={
                        payment.failedAt
                          ? `${formatDate(payment.failedAt)}${
                              [payment.failedByFirstName, payment.failedByLastName].filter(Boolean).length > 0
                                ? ` · by ${[payment.failedByFirstName, payment.failedByLastName].filter(Boolean).join(" ")}`
                                : ""
                            }`
                          : "—"
                      }
                      state="failed"
                      isLast
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:flex-1">
                    <VerticalStep
                      label="Recorded"
                      sublabel={payment.createdAt ? formatDate(payment.createdAt) : formatDate(payment.paymentAt)}
                      state="done"
                      isLast
                    />
                  </div>
                  <div className="sm:flex-1">
                    <VerticalStep
                      label="Pending Confirmation"
                      sublabel={payment.status === "pending" ? "Awaiting confirmation" : "Confirmation received"}
                      state={payment.status === "pending" ? "active" : "done"}
                      isLast
                    />
                  </div>
                  <div className="sm:flex-1">
                    <VerticalStep
                      label="Confirmed"
                      sublabel={
                        payment.status === "confirmed"
                          ? `${payment.confirmedAt ? formatDate(payment.confirmedAt) : "—"}${
                              [payment.confirmedByFirstName, payment.confirmedByLastName].filter(Boolean).length > 0
                                ? ` · by ${[payment.confirmedByFirstName, payment.confirmedByLastName].filter(Boolean).join(" ")}`
                                : ""
                            }`
                          : "—"
                      }
                      state={payment.status === "confirmed" ? "done" : "pending"}
                      isLast
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
