import { useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../../../components/ui/StatCard";
import { Pagination } from "../../../components/ui/Pagination";
import { formatKES, formatDate } from "../../../lib/format";
import type { Payment } from "../../../types/payment";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  paid: { bg: "bg-green-50 border-green-100", text: "text-green-700", label: "Paid" },
  pending: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", label: "Pending" },
  overdue: { bg: "bg-red-50 border-red-100", text: "text-red-600", label: "Overdue" },
};

function StatusBadge({ status }: { status: "paid" | "pending" | "overdue" }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    "M-Pesa": "bg-emerald-100 text-emerald-700",
    "Bank Transfer": "bg-blue-100 text-blue-700",
    Cash: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors[method] || "bg-gray-100 text-gray-700"}`}>
      {method}
    </span>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {payment.paymentId.slice(0, 2)}
          </div>
          <span className="font-semibold text-gray-900">{payment.paymentId}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900">{payment.customerName}</div>
          <div className="text-sm text-gray-500">{payment.customerEmail}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Link to={`/dashboard/invoices/${payment.invoiceId}`} className="text-blue-600 hover:underline font-medium">
          {payment.invoiceNumber}
        </Link>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatDate(payment.paymentDate)}
        <br />
        <span className="text-xs text-gray-400">
          {new Date(payment.paymentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </td>
      <td className="px-6 py-4 font-semibold text-gray-900">{formatKES(payment.amount)}</td>
      <td className="px-6 py-4">
        <MethodBadge method={payment.method} />
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={payment.status} />
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{payment.reference}</td>
      <td className="px-6 py-4 text-right text-gray-400 hover:text-gray-600 cursor-pointer">⋯</td>
    </tr>
  );
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [page, setPage] = useState(1);
  const isFetching = false; // Replace with real query state later

  // Mock data (replace with usePayments hook)
  const payments: Payment[] = [
    {
      id: "1",
      paymentId: "PAY-00005",
      customerName: "Evans Musyoki",
      customerEmail: "evansmusyoki@gmail.com",
      invoiceNumber: "INV-0012",
      invoiceId: "inv-12",
      paymentDate: "2025-06-03T10:30:00",
      amount: 80000,
      method: "Bank Transfer",
      status: "paid",
      reference: "KCB32456789",
    },
    {
      id: "2",
      paymentId: "PAY-00004",
      customerName: "Joshua Odhiambo",
      customerEmail: "joshua@gmail.com",
      invoiceNumber: "INV-0011",
      invoiceId: "inv-11",
      paymentDate: "2025-05-28T14:15:00",
      amount: 40000,
      method: "M-Pesa",
      status: "paid",
      reference: "MPESA7X89YZ",
    },
    {
      id: "3",
      paymentId: "PAY-00003",
      customerName: "Brian Otieno",
      customerEmail: "brian@gmail.com",
      invoiceNumber: "INV-0010",
      invoiceId: "inv-10",
      paymentDate: "2025-05-25T09:45:00",
      amount: 25600,
      method: "Bank Transfer",
      status: "pending",
      reference: "-",
    },
    // Add more entries to match your design...
  ];

  const filtered = payments.filter((p) => {
    const matchesSearch = 
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage payments received from your customers</p>
        </div>
        <Link
          to="/dashboard/payments/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + Record Payment
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Payments" value="KES 245,600.00" iconBg="#ECFDF5" icon={<div className="text-2xl">💰</div>} />
        <StatCard label="Paid This Month" value="KES 120,000.00" iconBg="#EFF6FF" icon={<div className="text-2xl">✅</div>} />
        <StatCard label="Pending Payments" value="KES 125,600.00" iconBg="#FEF3C7" icon={<div className="text-2xl">⏳</div>} />
        <StatCard label="Overdue Payments" value="KES 15,600.00" iconBg="#FEE2E2" icon={<div className="text-2xl">⚠️</div>} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search payments by customer, invoice or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 border border-gray-200 rounded-2xl"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <button className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-medium hover:bg-gray-50">Export</button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-5 text-left">PAYMENT ID</th>
              <th className="px-6 py-5 text-left">CUSTOMER</th>
              <th className="px-6 py-5 text-left">INVOICE</th>
              <th className="px-6 py-5 text-left">PAYMENT DATE</th>
              <th className="px-6 py-5 text-left">AMOUNT</th>
              <th className="px-6 py-5 text-left">METHOD</th>
              <th className="px-6 py-5 text-left">STATUS</th>
              <th className="px-6 py-5 text-left">REFERENCE</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((p) => <PaymentRow key={p.id} payment={p} />)}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          isFetching={isFetching}
          onPageChange={setPage}
          itemLabel="payments"
        />
      </div>
    </div>
  );
}