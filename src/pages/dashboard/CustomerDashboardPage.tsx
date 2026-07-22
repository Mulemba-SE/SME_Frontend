import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useInvoices } from "../../hooks/useInvoices";
import { useAuth } from "../../hooks/useAuth";
import { usePayments } from "../../hooks/usePayments";
import { StatCard } from "../../components/ui/StatCard";
import { InvoiceStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { formatKES, formatDate } from "../../lib/format";
import type { InvoiceListItem } from "../../types/invoice";
import type { PaymentListItem } from "../../types/payment";
import { FileText, Receipt } from "lucide-react";

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

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    isError: invoicesError,
    error: invoicesErrorObj,
  } = useInvoices({ status: "all", page: 1, limit: PAGE_SIZE, sortBy: "CREATE_DATE", sortDirection: "DESC", mine: true });

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
    error: paymentsErrorObj,
  } = usePayments({ page: 1, limit: PAGE_SIZE, mine: true });

  const invoicesUnavailable = invoicesLoading;
  const paymentsUnavailable = paymentsLoading;

  const firstName = user?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0),
    [payments]
  );

  const totalInvoices = useMemo(() => invoices.length, [invoices.length]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Total invoices"
          value={invoicesUnavailable ? "—" : String(totalInvoices)}
          iconBg="#EFF6FF"
          icon={
            <svg width="18" height="18" fill="none" stroke="#2563EB" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />

        <StatCard
          label="Total paid"
          value={paymentsUnavailable ? "—" : formatKES(totalPaid ?? 0)}
          iconBg="#ECFDF5"
          icon={
            <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
          }
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
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
              ) : invoices.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-4 py-8">
                      <EmptyState
                        title="No invoices yet"
                        message="Your invoices will appear here once they are available."
                      />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice, index) => (
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
            ) : payments.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-4 py-8">
                    <EmptyState
                      title="No payments yet"
                      message="Payments will appear here once they are recorded."
                    />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment, index) => (
                  <PaymentRow key={payment.paymentNo} payment={payment} index={index} />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
