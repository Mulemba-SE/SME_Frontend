import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useInvoices, useInvoiceStats } from "../../../hooks/useInvoices";
import { getApiErrorMessage } from "../../../api/auth";
import { StatCard } from "../../../components/ui/StatCard";
import { Pagination } from "../../../components/ui/Pagination";
import { formatKES, formatDate } from "../../../lib/format";
import type { Invoice, InvoiceStatus } from "../../../types/invoice";

const PAGE_SIZE = 8;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

// ─── Status Badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<InvoiceStatus, { bg: string; text: string; dot: string; label: string }> = {
  paid: { bg: "bg-green-50 border-green-100", text: "text-green-700", dot: "bg-green-500", label: "Paid" },
  pending: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  overdue: { bg: "bg-red-50 border-red-100", text: "text-red-600", dot: "bg-red-400", label: "Overdue" },
  draft: { bg: "bg-gray-100 border-gray-200", text: "text-gray-500", dot: "bg-gray-400", label: "Draft" },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Row Actions ─────────────────────────────────────────────────────────────

function RowActions({ invoiceId }: { invoiceId: string }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        to={`/dashboard/invoices/${invoiceId}`}
        className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="View invoice"
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </Link>
      <button
        type="button"
        className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="More actions"
      >
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-16" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-32" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
          <td className="px-4 py-3.5 w-20" />
        </tr>
      ))}
    </tbody>
  );
}

// ─── Empty / Error States ─────────────────────────────────────────────────────

function InlineEmpty({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
        <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="text-sm font-semibold text-gray-900 mb-1">No invoices match these filters</p>
          <p className="text-sm text-gray-500">Try a different search or clear the filters.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-900 mb-1">No invoices yet</p>
          <p className="text-sm text-gray-500 mb-4">Create your first invoice to start getting paid.</p>
          <Link
            to="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Create Invoice
          </Link>
        </>
      )}
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Couldn't load invoices</p>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
    </div>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  return (
    <tr className="hover:bg-gray-50/70 transition-colors">
      <td className="px-4 py-3.5">
        <Link
          to={`/dashboard/invoices/${invoice.id}`}
          className="font-semibold text-blue-600 hover:text-blue-700 text-sm"
        >
          {invoice.invoiceNumber}
        </Link>
      </td>
      <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{invoice.customerName}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(invoice.issueDate)}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">{formatKES(invoice.amount)}</td>
      <td className="px-4 py-3.5">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3.5 w-20">
        <RowActions invoiceId={invoice.id} />
      </td>
    </tr>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

export default function InvoicesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [page, setPage] = useState(1);

  const search = useDebouncedValue(searchInput, 350);

  const { data, isLoading, isError, error, isFetching } = useInvoices({
    search,
    status,
    page,
    limit: PAGE_SIZE,
  });
  const { data: stats } = useInvoiceStats();

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleStatusChange = (value: InvoiceStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create, view and manage all your invoices.</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>
          <Link
            to="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Invoice
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total Invoiced"
          value={formatKES(stats?.totalInvoiced ?? 0)}
          subtext={`${stats?.totalInvoicedCount ?? 0} invoices`}
          iconBg="#EEF2FF"
          icon={
            <svg width="20" height="20" fill="none" stroke="#4F46E5" strokeWidth="1.8" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Paid Amount"
          value={formatKES(stats?.paidAmount ?? 0)}
          subtext={`${stats?.paidCount ?? 0} invoices paid`}
          iconBg="#F0FDF4"
          icon={
            <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
          }
        />
        <StatCard
          label="Outstanding"
          value={formatKES(stats?.outstandingAmount ?? 0)}
          subtext={`${stats?.overdueCount ?? 0} overdue invoices`}
          iconBg="#FEF3C7"
          icon={
            <svg width="20" height="20" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Draft Invoices"
          value={String(stats?.draftCount ?? 0)}
          subtext={`${stats?.draftCount ?? 0} draft invoices`}
          iconBg="#F3E8FF"
          icon={
            <svg width="20" height="20" fill="none" stroke="#9333EA" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8"
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search invoices..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none
              placeholder:text-gray-400 text-gray-900
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus | "all")}
          className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-700
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice #</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <TableSkeleton />
            </table>
          </div>
        ) : isError ? (
          <InlineError message={getApiErrorMessage(error, "Couldn't load invoices. Please try again.")} />
        ) : invoices.length === 0 ? (
          <InlineEmpty hasFilters={Boolean(search) || status !== "all"} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice #</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} />
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              isFetching={isFetching}
              onPageChange={setPage}
              itemLabel="invoices"
            />
          </>
        )}
      </div>
    </div>
  );
}
