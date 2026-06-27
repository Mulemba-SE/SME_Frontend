import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCustomerStats } from "../../hooks/useCustomers";
import { useInvoices, useInvoiceStats } from "../../hooks/useInvoices";
import { formatKES, formatDate } from "../../lib/format";

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  comingSoon?: boolean;
}

function QuickAction({ label, description, icon, onClick, comingSoon }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={comingSoon}
      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all w-full ${
        comingSoon
          ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {comingSoon && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
              Coming soon
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = useInvoiceStats();
  const { data: recentInvoicesResponse, isLoading: recentLoading, isError: recentError } = useInvoices({ status: "all", page: 1, limit: 4 });

  const firstName = user?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data:statsData } = useCustomerStats();
  const customerCount = statsData?.totalCustomers ?? 0;
  const recentInvoices = recentInvoicesResponse?.data ?? [];  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatKES(stats?.totalInvoiced ?? 0)}
          sub={stats?.totalInvoicedCount ? `${stats.totalInvoicedCount} invoices` : "No invoices yet"}
          accent="bg-blue-50"
          icon={
            <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Outstanding"
          value={formatKES(stats?.outstandingAmount ?? 0)}
          sub={stats?.overdueCount ? `${stats.overdueCount} overdue` : "No overdue invoices"}
          accent="bg-amber-50"
          icon={
            <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Invoices Sent"
          value={String(stats?.totalInvoicedCount ?? 0)}
          sub="All invoices created"
          accent="bg-green-50"
          icon={
            <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <StatCard
          label="Customers"
          value={String(customerCount)}
          sub={customerCount ? "Active customers" : "Add your first customer"}
          accent="bg-purple-50"
          icon={
            <svg width="18" height="18" fill="none" stroke="#9333ea" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickAction
            label="Create an invoice"
            description="Generate a professional invoice and send it to a customer."
            onClick={() => navigate("/dashboard/invoices/new")}
            icon={
              <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            }
          />
          <QuickAction
            label="Add a customer"
            description="Save a customer's details to use them across invoices."
            onClick={() => navigate("/dashboard/customers/new")}
            icon={
              <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            }
          />
          <QuickAction
            label="Record a payment"
            description="Mark an invoice as paid and track received payments."
            onClick={() => navigate("/dashboard/payments")}
            icon={
              <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            }
          />
          <QuickAction
            label="View reports"
            description="See monthly revenue breakdowns and download PDF reports."
            onClick={() => navigate("/dashboard/reports")}
            icon={
              <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent invoices</h2>
          <Link to="/dashboard/invoices" className="text-sm text-blue-600 hover:text-blue-700">
            View all invoices
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {recentLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : recentError ? (
            <div className="p-6 text-sm text-red-600">Unable to load recent invoices. Please refresh.</div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm font-semibold text-gray-900">No invoices yet</p>
              <p className="text-sm text-gray-500 max-w-xs">
                Create your first invoice to see it appear here with your invoice totals and payment status.
              </p>
              <Link
                to="/dashboard/invoices/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                + Create Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        <Link to={`/dashboard/invoices/${invoice.id}`} className="hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{invoice.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatKES(invoice.amount)}</td>
                      <td className="px-4 py-3 text-sm uppercase text-gray-500">{invoice.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
