import { useState } from "react";
import { Link } from "react-router-dom";
import { useInvoices, useMyDashboardStats } from "../../hooks/useInvoices";
import { useAuth } from "../../hooks/useAuth";
import { usePayments } from "../../hooks/usePayments";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { StatCard } from "../../components/ui/StatCard";
import { Pagination } from "../../components/ui/Pagination";
import { InvoiceStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { formatKES, formatDate } from "../../lib/format";
import type { InvoiceListItem } from "../../types/invoice";
import type { PaymentListItem } from "../../types/payment";
import { FileText, Receipt, Search } from "lucide-react";

const PAGE_SIZE = 5;
const COLUMN_COUNT = 6;

const iconColors = [
  "bg-blue-50 text-blue-600",
  "bg-orange-50 text-orange-500",
  "bg-green-50 text-green-600",
  "bg-purple-50 text-purple-600",
  "bg-red-50 text-red-600",
];

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          {Array.from({ length: COLUMN_COUNT }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-3 bg-gray-100 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="p-10 border border-dashed border-gray-200 rounded-3xl text-center bg-white">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{message}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-10 border border-red-100 rounded-3xl text-center bg-red-50">
      <p className="text-sm font-semibold text-red-900">Unable to load data</p>
      <p className="mt-2 text-sm text-red-600 max-w-md mx-auto">{message}</p>
    </div>
  );
}

function InvoiceRow({ invoice, index }: { invoice: InvoiceListItem; index: number }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <Link
          to={`/dashboard/invoices/${invoice.invoiceNo}`}
          className="flex items-center gap-3 group"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColors[index % iconColors.length]}`}
          >
            <FileText size={18} />
          </div>

          <span className="font-semibold text-blue-600 group-hover:text-blue-700">
            INV-{invoice.invoiceNo}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{invoice.createdAt ? formatDate(invoice.createdAt) : "—"}</td>
      <td className="px-4 py-4 text-sm text-gray-900 font-semibold whitespace-nowrap">{formatKES(invoice.invoiceTotal ?? 0)}</td>
      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{invoice.dueDate ? formatDate(invoice.dueDate) : "—"}</td>
      <td className="px-4 py-4 text-sm text-blue-600 whitespace-nowrap">
        <Link to={`/dashboard/invoices/${invoice.invoiceNo}`} className="font-medium hover:text-blue-700">
          View
        </Link>
      </td>
    </tr>
  );
}

function PaymentRow({ payment, index }: { payment: PaymentListItem; index: number }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <Link
          to={`/dashboard/payments/${payment.paymentNo}`}
          className="flex items-center gap-3 group"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColors[index % iconColors.length]}`}
          >
            <Receipt size={18} />
          </div>

          <span className="font-semibold text-blue-600 group-hover:text-blue-700">
            PAY-{String(payment.paymentNo).padStart(6, "0")}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{payment.paymentAt ? formatDate(payment.paymentAt) : "—"}</td>
      <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{formatKES(payment.amount)}</td>
      <td className="px-4 py-4 text-sm whitespace-nowrap">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="px-4 py-4 text-sm text-blue-600 whitespace-nowrap">
        <Link to={`/dashboard/invoices/${payment.invoiceNo}`} className="font-medium hover:text-blue-700">
          INV-{payment.invoiceNo}
        </Link>
      </td>
      <td className="px-4 py-4 text-sm text-blue-600 whitespace-nowrap">
        <Link to={`/dashboard/payments/${payment.paymentNo}`} className="font-medium hover:text-blue-700">
          View
        </Link>
      </td>
    </tr>
  );
}

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "payments">("invoices");
  const { user } = useAuth();

  const [invoiceSearchInput, setInvoiceSearchInput] = useState("");
  const [invoicePage, setInvoicePage] = useState(1);
  const invoiceSearch = useDebouncedValue(invoiceSearchInput, 350);
  const trimmedInvoiceSearch = invoiceSearch.trim();
  const invoiceSearchNumber = Number(trimmedInvoiceSearch);
  const hasValidInvoiceSearch =
    trimmedInvoiceSearch !== "" && Number.isFinite(invoiceSearchNumber) && invoiceSearchNumber > 0;

  const [paymentSearchInput, setPaymentSearchInput] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);
  const paymentSearch = useDebouncedValue(paymentSearchInput, 350);
  const trimmedPaymentSearch = paymentSearch.trim();
  const paymentSearchNumber = Number(trimmedPaymentSearch);
  const hasValidPaymentSearch =
    trimmedPaymentSearch !== "" && Number.isFinite(paymentSearchNumber) && paymentSearchNumber > 0;

  const handleInvoiceSearchChange = (value: string) => {
    setInvoiceSearchInput(value);
    setInvoicePage(1);
  };

  const handlePaymentSearchChange = (value: string) => {
    setPaymentSearchInput(value);
    setPaymentPage(1);
  };

  const {
    data: tableInvoices = [],
    isLoading: invoicesLoading,
    isFetching: invoicesFetching,
    isError: invoicesError,
    error: invoicesErrorObj,
  } = useInvoices({
    status: "all",
    invoiceNo: hasValidInvoiceSearch ? invoiceSearchNumber : undefined,
    page: invoicePage,
    limit: PAGE_SIZE,
    sortBy: "CREATE_DATE",
    sortDirection: "DESC",
    mine: true,
  });

  const {
    data: tablePayments = [],
    isLoading: paymentsLoading,
    isFetching: paymentsFetching,
    isError: paymentsError,
    error: paymentsErrorObj,
  } = usePayments({
    paymentNo: hasValidPaymentSearch ? paymentSearchNumber : undefined,
    page: paymentPage,
    limit: PAGE_SIZE,
    mine: true,
  });

  // Real, backend-computed stats for the cards up top — independent of the
  // table's search/pagination, and not limited to whatever page happens to
  // be fetched for the table below. Uses the customer-scoped dashboard
  // endpoint (GET /invoices/mine/dashboard), not the staff-only STATS routes.
  const {
    data: dashboardStats,
    isLoading: dashboardStatsLoading,
    isError: dashboardStatsError,
  } = useMyDashboardStats();

  const invoiceTotalPages = invoicePage + (tableInvoices.length === PAGE_SIZE ? 1 : 0);
  const paymentTotalPages = paymentPage + (tablePayments.length === PAGE_SIZE ? 1 : 0);

  const statsUnavailable = dashboardStatsLoading || dashboardStatsError;

  const firstName = user?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalInvoices = dashboardStats?.totalInvoices;
  const totalPaid = dashboardStats?.totalPaid ?? 0;
  const outstandingBalance = dashboardStats?.outstandingBalance ?? 0;
  const overdueInvoicesCount = dashboardStats?.overdueInvoices ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">Here’s your billing overview.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                <StatCard
          label="Outstanding Balance"
          value={statsUnavailable ? "—" : formatKES(outstandingBalance)}
          iconBg="#FEF3C7"
          icon={
            <svg width="18" height="18" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M16 12h.01" />
            </svg>
          }
        />
        
        <StatCard
          label="Total Invoices"
          value={statsUnavailable ? "—" : String(totalInvoices ?? 0)}
          iconBg="#EFF6FF"
          icon={
            <svg width="18" height="18" fill="none" stroke="#2563EB" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />

        <StatCard
          label="Total Paid"
          value={statsUnavailable ? "—" : formatKES(totalPaid ?? 0)}
          iconBg="#ECFDF5"
          icon={
            <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
          }
        />



        <StatCard
          label="Overdue Invoices"
          value={statsUnavailable ? "—" : String(overdueInvoicesCount)}
          iconBg="#FEE2E2"
          icon={
            <svg width="18" height="18" fill="none" stroke="#DC2626" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "invoices"
                  ? "text-gray-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-300"
              }`}
            >
              Invoices
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "payments"
                  ? "text-gray-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-300"
              }`}
            >
              Payments
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            {activeTab === "invoices" ? (
              <input
                type="text"
                value={invoiceSearchInput}
                onChange={(e) => handleInvoiceSearchChange(e.target.value)}
                placeholder="Search by invoice number..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 bg-white rounded-lg outline-none
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            ) : (
              <input
                type="text"
                value={paymentSearchInput}
                onChange={(e) => handlePaymentSearchChange(e.target.value)}
                placeholder="Search by payment number..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 bg-white rounded-lg outline-none
                  placeholder:text-gray-400 text-gray-900
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-4">{activeTab === "invoices" ? "Invoice No" : "Payment No"}</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">{activeTab === "invoices" ? "Due Date" : "Invoice"}</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            {activeTab === "invoices" ? (
              invoicesLoading ? (
                <TableSkeleton />
              ) : invoicesError ? (
                <tbody>
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-4 py-8">
                      <ErrorState message={String(invoicesErrorObj ?? "Unable to load invoices.")} />
                    </td>
                  </tr>
                </tbody>
              ) : tableInvoices.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-4 py-8">
                      <EmptyState
                        title={hasValidInvoiceSearch ? "No matching invoices" : "No invoices yet"}
                        message={
                          hasValidInvoiceSearch
                            ? "Try a different invoice number."
                            : "Your invoices will appear here once they are available."
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-gray-100">
                  {tableInvoices.map((invoice, index) => (
                    <InvoiceRow key={invoice.invoiceNo} invoice={invoice} index={index} />
                  ))}
                </tbody>
              )
            ) : paymentsLoading ? (
              <TableSkeleton />
            ) : paymentsError ? (
              <tbody>
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-4 py-8">
                    <ErrorState message={String(paymentsErrorObj ?? "Unable to load payments.")} />
                  </td>
                </tr>
              </tbody>
            ) : tablePayments.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-4 py-8">
                    <EmptyState
                      title={hasValidPaymentSearch ? "No matching payments" : "No payments yet"}
                      message={
                        hasValidPaymentSearch
                          ? "Try a different payment number."
                          : "Payments will appear here once they are recorded."
                      }
                    />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-100">
                {tablePayments.map((payment, index) => (
                  <PaymentRow key={payment.paymentNo} payment={payment} index={index} />
                ))}
              </tbody>
            )}
          </table>
        </div>

        {activeTab === "invoices"
          ? !invoicesLoading &&
            !invoicesError &&
            tableInvoices.length > 0 && (
              <Pagination
                page={invoicePage}
                totalPages={invoiceTotalPages}
                itemCount={tableInvoices.length}
                pageSize={PAGE_SIZE}
                isFetching={invoicesFetching}
                onPageChange={setInvoicePage}
                itemLabel="invoices"
              />
            )
          : !paymentsLoading &&
            !paymentsError &&
            tablePayments.length > 0 && (
              <Pagination
                page={paymentPage}
                totalPages={paymentTotalPages}
                itemCount={tablePayments.length}
                pageSize={PAGE_SIZE}
                isFetching={paymentsFetching}
                onPageChange={setPaymentPage}
                itemLabel="payments"
              />
            )}
      </div>
    </div>
  );
}
