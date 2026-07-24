import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, CreditCard, FilePlus2, FileText, Receipt, UserPlus, WalletCards } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useInvoices, useInvoiceStats } from "../../hooks/useInvoices";
import { usePayments } from "../../hooks/usePayments";
import { StatCard } from "../../components/ui/StatCard";
import { InvoiceStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge";
import { formatDate, formatKES } from "../../lib/format";
import type { InvoiceListItem } from "../../types/invoice";
import type { PaymentListItem } from "../../types/payment";

const RECENT_LIMIT = 5;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function customerName(invoice: InvoiceListItem) {
  return [invoice.firstName, invoice.lastName].filter(Boolean).join(" ") || "Unassigned customer";
}

function QuickAction({
  label,
  description,
  icon,
  accent,
  iconColor,
  onClick,
  centered = false,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  iconColor: string;
  onClick: () => void;
  centered?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full w-full items-center gap-2.5 sm:gap-3 rounded-2xl p-3 sm:p-4 shadow-sm transition-all ${
        centered ? "justify-center text-center sm:justify-start sm:text-left" : "text-left sm:items-start"
      } ${accent} hover:shadow-md`}
    >
      <span className={`flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 ${iconColor}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        <span className="mt-1 hidden sm:block text-xs leading-relaxed text-gray-500">{description}</span>
      </span>
    </button>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-gray-700">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="p-6 text-sm text-gray-500">{message}</div>;
}

function InvoiceList({ invoices }: { invoices: InvoiceListItem[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {invoices.map((invoice) => (
        <Link
          key={invoice.invoiceNo}
          to={`/dashboard/invoices/${invoice.invoiceNo}`}
          className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-gray-50"
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-blue-600">INV-{invoice.invoiceNo}</span>
            <span className="block truncate text-xs text-gray-500">{customerName(invoice)}</span>
          </span>
          <span className="flex-shrink-0 text-right">
            <span className="block text-sm font-semibold text-gray-900">{formatKES(invoice.invoiceTotal ?? 0)}</span>
            <span className="mt-1 block">
              <InvoiceStatusBadge status={invoice.status ?? "draft"} size="xs" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function PaymentList({ payments }: { payments: PaymentListItem[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {payments.map((payment) => (
        <Link
          key={payment.paymentNo}
          to={`/dashboard/payments/${payment.paymentNo}`}
          className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-gray-50"
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Receipt size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-blue-600">
              PAY-{String(payment.paymentNo).padStart(6, "0")}
            </span>
            <span className="block truncate text-xs text-gray-500">
              INV-{payment.invoiceNo} - {payment.paymentAt ? formatDate(payment.paymentAt) : "No date"}
            </span>
          </span>
          <span className="flex-shrink-0 text-right">
            <span className="block text-sm font-semibold text-gray-900">{formatKES(payment.amount)}</span>
            <span className="mt-1 block">
              <PaymentStatusBadge status={payment.status} size="xs" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function StaffDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: invoiceStats,
    isLoading: invoiceStatsLoading,
    isError: invoiceStatsError,
  } = useInvoiceStats();
  const {
    data: recentInvoices = [],
    isLoading: recentInvoicesLoading,
    isError: recentInvoicesError,
  } = useInvoices({
    status: "all",
    page: 1,
    limit: RECENT_LIMIT,
    sortBy: "CREATE_DATE",
    sortDirection: "DESC",
  });
  const {
    data: recentPayments = [],
    isLoading: recentPaymentsLoading,
    isError: recentPaymentsError,
  } = usePayments({
    status: "all",
    page: 1,
    limit: RECENT_LIMIT,
  });

  const invoiceStatsUnavailable = invoiceStatsLoading || invoiceStatsError;
  const firstName = user?.firstName ?? "there";

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Your daily billing workspace is ready.</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total invoices"
          value={invoiceStatsUnavailable ? "-" : String(invoiceStats?.total_invoices ?? 0)}
          subtext="All invoices in the system"
          iconBg="#EFF6FF"
          icon={<WalletCards size={18} color="#2563EB" />}
        />
        <StatCard
          label="Sent invoices"
          value={invoiceStatsUnavailable ? "-" : String(invoiceStats?.total_sent ?? 0)}
          subtext="Invoices sent to customers"
          iconBg="#FFF7ED"
          icon={<ClipboardList size={18} color="#EA580C" />}
        />
        <StatCard
          label="Outstanding invoices"
          value={invoiceStatsUnavailable ? "-" : String(invoiceStats?.outstanding_invoices ?? 0)}
          subtext="Invoices still unpaid"
          iconBg="#FEF3C7"
          icon={<Receipt size={18} color="#DC2626" />}
        />
        <StatCard
          label="Overdue invoices"
          value={invoiceStatsUnavailable ? "-" : String(invoiceStats?.overdue ?? 0)}
          subtext="Invoices past due date"
          iconBg="#F3E8FF"
          icon={<CreditCard size={18} color="#9333EA" />}
        />
      </div>

      <div className="mb-4">
        <h2 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Quick actions</h2>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <QuickAction
            label="Add Customer"
            description="Register a customer before billing."
            accent="bg-green-50"
            iconColor="text-green-600"
            icon={<UserPlus size={18} />}
            onClick={() => navigate("/dashboard/customers/new")}
            centered
          />
        </div>
        <QuickAction
          label="Create Invoice"
          description="Prepare and send a customer invoice."
          accent="bg-blue-50"
          iconColor="text-blue-600"
          icon={<FilePlus2 size={18} />}
          onClick={() => navigate("/dashboard/invoices/new")}
        />
        <QuickAction
          label="Record Payment"
          description="Log and track a customer payment."
          accent="bg-orange-50"
          iconColor="text-orange-600"
          icon={<CreditCard size={18} />}
          onClick={() => navigate("/dashboard/payments/new")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Recent invoices"
          action={
            <Link to="/dashboard/invoices" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </Link>
          }
        >
          {recentInvoicesLoading ? (
            <LoadingRows />
          ) : recentInvoicesError ? (
            <EmptyState message="Unable to load recent invoices." />
          ) : recentInvoices.length === 0 ? (
            <EmptyState message="No invoices have been created yet." />
          ) : (
            <InvoiceList invoices={recentInvoices} />
          )}
        </Panel>

        <Panel
          title="Recent payments"
          action={
            <Link to="/dashboard/payments" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </Link>
          }
        >
          {recentPaymentsLoading ? (
            <LoadingRows />
          ) : recentPaymentsError ? (
            <EmptyState message="Unable to load recent payments." />
          ) : recentPayments.length === 0 ? (
            <EmptyState message="No payments have been recorded yet." />
          ) : (
            <PaymentList payments={recentPayments} />
          )}
        </Panel>
      </div>
    </div>
  );
}
