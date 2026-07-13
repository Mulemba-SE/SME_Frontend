import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCustomers, useCustomerStats } from "../../../hooks/useCustomers";
import { getApiErrorMessage } from "../../../api/auth";
import { StatCard } from "../../../components/ui/StatCard";
import { Pagination } from "../../../components/ui/Pagination";
import { formatKES, formatDate } from "../../../lib/format";
import type { Customer } from "../../../types/customer";

type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

type SearchBy = "email" | "userNo" | "phoneNumber" | "dueDate";

const PAGE_SIZE = 8;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

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

const STATUS_STYLES: Record<InvoiceStatus, { bg: string; text: string; dot: string; label: string }> = {
  paid:    { bg: "bg-green-50 border-green-100",  text: "text-green-700", dot: "bg-green-500", label: "Paid" },
  pending: { bg: "bg-amber-50 border-amber-100",  text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  overdue: { bg: "bg-red-50 border-red-100",      text: "text-red-600",   dot: "bg-red-400",   label: "Overdue" },
  draft:   { bg: "bg-gray-100 border-gray-200",  text: "text-gray-500", dot: "bg-gray-400", label: "Draft" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status as InvoiceStatus] ?? {
    bg: "bg-gray-100 border-gray-200", text: "text-gray-500", dot: "bg-gray-400", label: status,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const { initials, bg, color } = getAvatarProps(name);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ background: bg, color }}
    >
      {initials}
    </div>
  );
}

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3.5 w-10">
            <div className="w-4 h-4 bg-gray-100 rounded" />
          </td>
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <div className="h-3.5 bg-gray-100 rounded w-24" />
            </div>
          </td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-32" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-24" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-16" /></td>
          <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 rounded-full w-14" /></td>
          <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-20" /></td>
        </tr>
      ))}
    </tbody>
  );
}

function InlineEmpty({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
        <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="text-sm font-semibold text-gray-900 mb-1">No customers match these filters</p>
          <p className="text-sm text-gray-500">Try a different search or clear the filters.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-900 mb-1">No customers yet</p>
          <p className="text-sm text-gray-500 mb-4">Add your first customer to start creating invoices.</p>
          <Link
            to="/dashboard/customers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Customer
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
      <p className="text-sm font-semibold text-gray-900 mb-1">Couldn't load customers</p>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
    </div>
  );
}

function deriveRow(c: Customer) {
  return { totalDue: c.total != null ? Number(c.total) : undefined };
}

function getCustomerRowKey(customer: Customer) {
  const userNo = customer.userNo != null ? String(customer.userNo) : "unknown";
  const invoiceNo = customer.invoiceNo != null ? String(customer.invoiceNo) : "none";
  return `${userNo}-${invoiceNo}`;
}

function CustomerRow({
  customer,
  selected,
  onToggle,
}: {
  customer: Customer;
  selected: boolean;
  onToggle: () => void;
}) {
  const { totalDue } = deriveRow(customer);
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email || "Customer";

  return (
    <tr className="hover:bg-gray-50/70 transition-colors group">
      <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
        />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={customerName} />
          <div>
            <Link
              to={`/dashboard/customers/${customer.userNo}`}
              className="font-semibold text-blue-600 hover:text-blue-700 text-sm block"
            >
              {customer.userNo || "—"}
            </Link>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500">{customer.email || "—"}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500">{customer.phoneNumber || "—"}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500">{customer.invoiceNo ?? "—"}</td>
      <td className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
        {totalDue == null ? (
          <span className="text-sm text-gray-500">—</span>
        ) : totalDue === 0 ? (
          <span className="text-green-600">Paid</span>
        ) : (
          <span className="text-gray-800">{formatKES(totalDue)}</span>
        )}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <StatusBadge status={customer.status ?? "—"} />
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
        {customer.dueDate ? formatDate(customer.dueDate) : "—"}
      </td>
    </tr>
  );
}


export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState<SearchBy>("email");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const search = useDebouncedValue(searchInput, 350);
  const searchPlaceholder =
    searchBy === "email"
      ? "Search customers by email..."
      : searchBy === "userNo"
      ? "Search customers by user number..."
      : searchBy === "phoneNumber"
      ? "Search customers by phone number..."
      : "Search customers by due date (YYYY-MM-DD)...";

  const { data, isLoading, isError, error, isFetching } = useCustomers({
    search,
    searchBy,
    status,
    page,
    limit: PAGE_SIZE,
  });

  const customers = data?.data ?? [];
  const total = data?.total;

  const { data: statsData, isLoading: statsLoading, isError: statsError } = useCustomerStats();
  const totalCustomersDisplay = statsLoading
    ? "Loading..."
    : statsError
    ? "—"
    : statsData?.totalCustomers?.toLocaleString() ?? "—";
  const newCustomersDisplay = statsLoading
    ? "Loading..."
    : statsError
    ? "—"
    : statsData?.newCustomers?.toLocaleString() ?? "—";
  const totalReceivablesDisplay = statsLoading
    ? "Loading..."
    : statsError
    ? "—"
    : statsData?.totalReceivables != null
    ? formatKES(Number(statsData.totalReceivables))
    : "—";
  const totalOverdueDisplay = statsLoading
    ? "Loading..."
    : statsError
    ? "—"
    : statsData?.totalOverdue != null
    ? formatKES(Number(statsData.totalOverdue))
    : "—";
  const pageItemCount = customers.length;
  const totalPages = total
    ? Math.max(1, Math.ceil(total / PAGE_SIZE))
    : page + (pageItemCount === PAGE_SIZE ? 1 : 0);

  const allSelected = customers.length > 0 && customers.every((c) => selected.has(c.userNo.toString()));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        customers.forEach((c) => next.delete(c.userNo.toString()));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        customers.forEach((c) => next.add(c.userNo.toString()));
        return next;
      });
    }
  };

  const toggleOne = (userNo: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userNo)) {
        next.delete(userNo);
      } else {
        next.add(userNo);
      }
      return next;
    });
  };

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
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your customers and their details</p>
          </div>
        </div>
        <Link
          to="/dashboard/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Customer
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total Customers"
          value={totalCustomersDisplay}
          iconBg="#EEF2FF"
          icon={
            <svg width="20" height="20" fill="none" stroke="#4F46E5" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
        <StatCard
          label="New Customers"
          value={newCustomersDisplay}
          iconBg="#F0FDF4"
          icon={
            <svg width="20" height="20" fill="none" stroke="#16A34A" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          }
        />
        <StatCard
          label="Total Receivables"
          value={totalReceivablesDisplay}
          iconBg="#FFF7ED"
          icon={
            <svg width="20" height="20" fill="none" stroke="#EA580C" strokeWidth="1.8" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Overdue Amount"
          value={totalOverdueDisplay}
          iconBg="#FEF3C7"
          icon={
            <svg width="20" height="20" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
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
            setSearchBy(e.target.value as SearchBy);
            setPage(1);
          }}
          className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-700
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all sm:w-48"
        >
          <option value="email">Email</option>
          <option value="userNo">Customer no</option>
          <option value="phoneNumber">Phone number</option>
          <option value="dueDate">Due date</option>
        </select>

        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus | "all")}
          className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none text-gray-700
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all sm:w-36"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>

        <button className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Due</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                </tr>
              </thead>
              <TableSkeleton />
            </table>
          </div>
        ) : isError ? (
          <InlineError message={getApiErrorMessage(error, "Couldn't load customers. Please try again.")} />
        ) : customers.length === 0 ? (
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
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">InvoiceNo</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Due</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => (
                    <CustomerRow
                      key={getCustomerRowKey(customer)}
                      customer={customer}
                      selected={selected.has(customer.userNo.toString())}
                      onToggle={() => toggleOne(customer.userNo.toString())}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemCount={customers.length}
              pageSize={PAGE_SIZE}
              isFetching={isFetching}
              onPageChange={setPage}
              itemLabel="customers"
            />
          </>
        )}
      </div>
    </div>
  );
}