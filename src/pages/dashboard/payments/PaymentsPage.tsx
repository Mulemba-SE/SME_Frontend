import { useState } from "react";
import { Link } from "react-router-dom";
import { usePayments, usePaymentStats } from "../../../hooks/usePayments";
import { getApiErrorMessage } from "../../../api/client";
import { StatCard } from "../../../components/ui/StatCard";
import { Pagination } from "../../../components/ui/Pagination";
import { PaymentStatusBadge as StatusBadge } from "../../../components/ui/StatusBadge";
import { MethodBadge } from "../../../components/ui/MethodBadge";
import { formatKES, formatDate } from "../../../lib/format";
import type { PaymentListItem, PaymentStatus } from "../../../types/payment";

const PAGE_SIZE = 10;

function InlineEmpty({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 2v20" />
          <path d="M2 12h20" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">
        {hasFilters ? "No payments match these filters" : "No payments yet"}
      </p>
      <p className="text-sm text-gray-500">
        {hasFilters ? "Try a different search or clear the filters." : "Payments will appear here once recorded."}
      </p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3.5 w-10"><div className="w-4 h-4 bg-gray-100 rounded" /></td>
          <td className="px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100" />
              <div className="h-3.5 bg-gray-100 rounded w-24" />
            </div>
          </td>
          <td className="px-4 py-3.5 sm:px-6"><div className="h-3 bg-gray-100 rounded w-32" /></td>
          <td className="px-4 py-3.5 sm:px-6"><div className="h-3 bg-gray-100 rounded w-24" /></td>
          <td className="px-4 py-3.5 sm:px-6"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5 sm:px-6"><div className="h-3 bg-gray-100 rounded w-24" /></td>
          <td className="px-4 py-3.5 sm:px-6"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5 sm:px-6"><div className="h-3 bg-gray-100 rounded w-24" /></td>
        </tr>
      ))}
    </tbody>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <svg width="24" height="24" fill="none" stroke="#dc2626" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Couldn't load payments</p>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
    </div>
  );
}

function PaymentRow({ payment }: { payment: PaymentListItem }) {
  const customerLabel = payment.customerNo ? `${payment.customerNo}` : "—";

  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap">
        <Link to={`/dashboard/payments/${payment.paymentNo}`} className="font-semibold text-blue-600 hover:text-blue-700">
          PAY-{String(payment.paymentNo).padStart(6, "0")}
        </Link>
      </td>
      <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap text-sm text-gray-600">
        INV-{payment.invoiceNo}
      </td>
      <td className="px-4 py-3.5 sm:px-6">
        <div>
          <div className="font-medium text-gray-900">{customerLabel}</div>
          {payment.notes ? <div className="text-sm text-gray-500">{payment.notes}</div> : null}
        </div>
      </td>
      <td className="px-4 py-3.5 sm:px-6 text-sm text-gray-600 whitespace-nowrap">{formatDate(payment.paymentAt)}</td>
      <td className="px-4 py-3.5 sm:px-6 font-semibold text-gray-900 whitespace-nowrap">{formatKES(payment.amount)}</td>
      <td className="px-4 py-3.5 sm:px-6"><MethodBadge method={payment.paymentMethod} /></td>
      <td className="px-4 py-3.5 sm:px-6"><StatusBadge status={payment.status} /></td>
      <td className="px-4 py-3.5 sm:px-6 text-sm text-gray-600 font-mono">{payment.transactionRef || "-"}</td>
    </tr>
  );
}

  export default function PaymentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState<"paymentNo" | "invoiceNo" | "customerNo">("paymentNo");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);

  const trimmedSearch = searchInput.trim();
  const numericSearch = Number(trimmedSearch);
  const hasValidNumericSearch = trimmedSearch !== "" && Number.isFinite(numericSearch) && numericSearch > 0;

  const { data, isLoading, isError, error, isFetching } = usePayments({
    paymentNo: searchBy === "paymentNo" && hasValidNumericSearch ? numericSearch : undefined,
    invoiceNo: searchBy === "invoiceNo" && hasValidNumericSearch ? numericSearch : undefined,
    customerNo: searchBy === "customerNo" && hasValidNumericSearch ? numericSearch : undefined,
    status: statusFilter,
    page,
    limit: PAGE_SIZE,
  });

  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = usePaymentStats();
  const statsUnavailable = isStatsLoading || isStatsError;

  const payments = data ?? [];
  const totalPages = page + (payments.length === PAGE_SIZE ? 1 : 0);

  const totalRecorded =
    (stats?.pendingAmount ?? 0) + (stats?.confirmedAmount ?? 0) + (stats?.failedAmount ?? 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
              <path d="M7 15h3" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage payments received from your customers</p>
          </div>
        </div>
        <Link
          to="/dashboard/payments/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total Recorded"
          value={statsUnavailable ? "—" : formatKES(totalRecorded)}
          iconBg="#EFF6FF"
          icon={
            <svg width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="1.8" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Confirmed"
          value={statsUnavailable ? "—" : formatKES(stats?.confirmedAmount ?? 0)}
          iconBg="#ECFDF5"
          icon={
            <svg width="20" height="20" fill="none" stroke="#059669" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
          }
        />
        <StatCard
          label="Pending"
          value={statsUnavailable ? "—" : formatKES(stats?.pendingAmount ?? 0)}
          iconBg="#FEF3C7"
          icon={
            <svg width="20" height="20" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Failed"
          value={statsUnavailable ? "—" : formatKES(stats?.failedAmount ?? 0)}
          iconBg="#FEE2E2"
          icon={
            <svg width="20" height="20" fill="none" stroke="#DC2626" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

<div className="flex flex-col sm:flex-row gap-3 mb-4">
  <div className="relative flex-1">
    <svg
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      type="text"
      placeholder={
        searchBy === "paymentNo" ? "Search by payment number..." :
        searchBy === "invoiceNo" ? "Search by invoice number..." :
        "Search by customer number..."
      }
      value={searchInput}
      onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
    />
  </div>

  <select
    value={searchBy}
    onChange={(e) => { setSearchBy(e.target.value as "paymentNo" | "invoiceNo" | "customerNo"); setPage(1); }}
    className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all sm:w-44"
  >
    <option value="paymentNo">Payment no</option>
    <option value="invoiceNo">Invoice no</option>
    <option value="customerNo">Customer no</option>
  </select>

  <select
    value={statusFilter}
    onChange={(e) => { setStatusFilter(e.target.value as PaymentStatus | "all"); setPage(1); }}
    className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all sm:w-36"
  >
    <option value="all">All Status</option>
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="failed">Failed</option>
  </select>
</div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment No</th>

                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Invoice</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment Date</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                </tr>
              </thead>
              <TableSkeleton />
            </table>
          </div>
        ) : isError ? (
          <InlineError message={getApiErrorMessage(error, "Couldn't load payments. Please try again.")} />
        ) : payments.length === 0 ? (
        <InlineEmpty hasFilters={Boolean(searchInput) || statusFilter !== "all"} />
      ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment No</th>

                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment Date</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <PaymentRow key={`${p.paymentNo}-${p.invoiceNo}`} payment={p} />
              ))}
            </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          itemCount={payments.length}
          pageSize={PAGE_SIZE}
          isFetching={isFetching}
          onPageChange={setPage}
          itemLabel="payments"
        />
      </div>
    </div>
  );
}