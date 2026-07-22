import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useInvoices, useInvoiceStats } from "../../../hooks/useInvoices";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { getApiErrorMessage } from "../../../api/client";
import { StatCard } from "../../../components/ui/StatCard";
import { Pagination } from "../../../components/ui/Pagination";
import { InvoiceStatusBadge as StatusBadge } from "../../../components/ui/StatusBadge";
import { formatKES, formatDate } from "../../../lib/format";
import type { InvoiceListItem, InvoiceStatus } from "../../../types/invoice";

const PAGE_SIZE = 8;

// Skeleton

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3.5 w-10"><div className="w-4 h-4 bg-gray-100 rounded" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-16" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-14" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 bg-gray-100 rounded w-32" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
        </tr>
      ))}
    </tbody>
  );
}

// Empty / Error States

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

// Invoice Row

function getInvoiceRowKey(invoice: InvoiceListItem) {
  const invoiceNo = invoice.invoiceNo != null ? String(invoice.invoiceNo) : "unknown";
  const customerNo = invoice.customerNo != null ? String(invoice.customerNo) : "unknown";
  return `${invoiceNo}-${customerNo}`;
}

function InvoiceRow({
  invoice,
  selected,
  onToggle,
}: {
  invoice: InvoiceListItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const customerName = [invoice.firstName, invoice.lastName].filter(Boolean).join(" ") || "—";
  return (
    <tr className="hover:bg-gray-50/70 transition-colors">
      <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
        />
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <Link
          to={`/dashboard/invoices/${invoice.invoiceNo}`}
          className="font-semibold text-blue-600 hover:text-blue-700 text-sm"
        >
          INV-{invoice.invoiceNo}
        </Link>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{invoice.customerNo}</td>
      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">{customerName}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{invoice.createdAt ? formatDate(invoice.createdAt) : "—"}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{invoice.dueDate ? formatDate(invoice.dueDate) : "—"}</td>
      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 whitespace-nowrap">{formatKES(invoice.invoiceTotal ?? 0)}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatKES(invoice.amountPaid ?? 0)}</td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <StatusBadge status={invoice.status} />
      </td>
    </tr>
  );
}

// Icons

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
  const [searchBy, setSearchBy] = useState<"firstName" | "lastName" | "customerNo" | "invoiceNo">("firstName");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const search = useDebouncedValue(searchInput, 350);
  const normalizedStatus = status === "all" ? undefined : status.toUpperCase();
  const trimmedSearch = search.trim();
  const numericSearch = Number(trimmedSearch);
  const hasValidNumericSearch = trimmedSearch !== "" && Number.isFinite(numericSearch) && numericSearch > 0;

  const { user } = useAuth();
  const isCustomer = Boolean(user?.roles?.includes("CUSTOMER"));

  const { data, isLoading, isError, error, isFetching } = useInvoices({
    firstName: searchBy === "firstName" ? (trimmedSearch || undefined) : undefined,
    lastName: searchBy === "lastName" ? (trimmedSearch || undefined) : undefined,
    customerNo: searchBy === "customerNo" && hasValidNumericSearch ? numericSearch : undefined,
    invoiceNo: searchBy === "invoiceNo" && hasValidNumericSearch ? numericSearch : undefined,
    status: normalizedStatus,
    page,
    limit: PAGE_SIZE,
    mine: isCustomer,
  });

  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useInvoiceStats({ enabled: !isCustomer });
  const statsUnavailable = isStatsLoading || isStatsError;

  const rawInvoices = Array.isArray(data) ? data : [];
  const invoices = rawInvoices.filter((invoice): invoice is InvoiceListItem & { invoiceNo: number; customerNo: number } => {
    const hasInvoiceNo = invoice.invoiceNo != null;
    const hasCustomerNo = invoice.customerNo != null;
    return hasInvoiceNo && hasCustomerNo;
  });
 
  const totalPages = page + (rawInvoices.length === PAGE_SIZE ? 1 : 0);

  const searchPlaceholder =
    searchBy === "firstName"
      ? "Search by first name..."
      : searchBy === "lastName"
      ? "Search by last name..."
      : searchBy === "customerNo"
      ? "Search by customer number..."
      : "Search by invoice number...";

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleStatusChange = (value: InvoiceStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  const allSelected = invoices.length > 0 && invoices.every((inv) => selected.has(inv.invoiceNo));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        invoices.forEach((inv) => next.delete(inv.invoiceNo));
      } else {
        invoices.forEach((inv) => next.add(inv.invoiceNo));
      }
      return next;
    });
  };

  const toggleOne = (invoiceNo: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceNo)) {
        next.delete(invoiceNo);
      } else {
        next.add(invoiceNo);
      }
      return next;
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create, view and manage all your invoices.</p>
          </div>
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
          label="Total Receivables"
          value={statsUnavailable ? "—" : formatKES(stats?.amount_receivables ?? 0)}
          iconBg="#EEF2FF"
          icon={
            <svg width="20" height="20" fill="none" stroke="#4F46E5" strokeWidth="1.8" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Overdue Amount"
          value={statsUnavailable ? "—" : formatKES(stats?.amount_overdue ?? 0)}
          iconBg="#FEF3C7"
          icon={
            <svg width="20" height="20" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Pending Invoices"
          value={statsUnavailable ? "—" : String(stats?.pending ?? 0)}
          iconBg="#F0FDF4"
          icon={
            <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
          }
        />
        <StatCard
          label="Total Drafts"
          value={statsUnavailable ? "—" : String(stats?.draft ?? 0)}
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
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none
              placeholder:text-gray-400 text-gray-900
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <select
          value={searchBy}
          onChange={(e) => {
            setSearchBy(e.target.value as "firstName" | "lastName" | "customerNo" | "invoiceNo");
            setPage(1);
          }}
          className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-700
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all sm:w-44"
        >
          <option value="firstName">First name</option>
          <option value="lastName">Last name</option>
          <option value="customerNo">Customer no</option>
          <option value="invoiceNo">Invoice no</option>
        </select>

        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus | "all")}
          className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-700
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="PAID">Paid</option>
          <option value="SENT">Sent</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="DRAFT">Draft</option>
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
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
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Invoice #</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Customer No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount Paid</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
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
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Invoice #</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Customer No</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount Paid</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((invoice) => (
                    <InvoiceRow
                      key={getInvoiceRowKey(invoice)}
                      invoice={invoice}
                      selected={selected.has(invoice.invoiceNo)}
                      onToggle={() => toggleOne(invoice.invoiceNo)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              itemCount={invoices.length}
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
