import { useState } from "react";
import { Link } from "react-router-dom";
import { useReportsSummary, useRevenueChart, usePaymentsByMethod, useTopCustomers } from "../../hooks/useReports";
import { formatKES, formatDate } from "../../lib/format";
import type { ReportGranularity } from "../../types/report";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const METHOD_LABELS: Record<string, string> = {
  M_PESA: "M-Pesa",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
};

const METHOD_COLORS: Record<string, string> = {
  M_PESA: "#2563eb",
  BANK_TRANSFER: "#16a34a",
  CASH: "#f28305",
};

function methodLabel(method: string) {
  return METHOD_LABELS[method] ?? method;
}

function methodColor(method: string) {
  return METHOD_COLORS[method] ?? "#07f717";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function getPriorPeriodLabel(from: string, to: string): string {
  const fromDate = new Date(from + "T00:00:00");
  const toDate = new Date(to + "T00:00:00");
  const periodDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;

  const priorTo = new Date(fromDate);
  priorTo.setDate(priorTo.getDate() - 1);
  const priorFrom = new Date(priorTo);
  priorFrom.setDate(priorFrom.getDate() - periodDays + 1);

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  return `${fmt(priorFrom)} - ${fmt(priorTo)}`;
}

function TrendBadge({ pct }: { pct: number }) {
  const isPositive = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        {isPositive ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
      </svg>
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function ReportStatCard({
  label,
  value,
  changePct,
  comparisonLabel,
  iconBg,
  icon,
}: {
  label: string;
  value: string;
  changePct: number;
  comparisonLabel: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <TrendBadge pct={changePct} />
        <span>vs {comparisonLabel}</span>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading chart…</div>;
}

export default function ReportsPage() {
  const [from, setFrom] = useState(daysAgoISO(7));
  const [to, setTo] = useState(todayISO());
  const [granularity, setGranularity] = useState<ReportGranularity>("DAILY");

  const filterParams = { from, to, granularity };
  const comparisonLabel = getPriorPeriodLabel(from, to);

  const { data: summary, isLoading: summaryLoading } = useReportsSummary(filterParams);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart(filterParams);
  const { data: methodData, isLoading: methodLoading } = usePaymentsByMethod(filterParams);
  const { data: topCustomers, isLoading: topCustomersLoading } = useTopCustomers(filterParams, 5);

  const chartData = (revenueData ?? []).map((p) => ({
    date: formatShortDate(p.bucketDate),
    amount: p.amount,
  }));


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="12" width="4" height="9" />
              <rect x="10" y="7" width="4" height="14" />
              <rect x="17" y="3" width="4" height="18" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">Insights and analytics about your business performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm">
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="outline-none text-gray-700"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={to}
              min={from}
              max={todayISO()}
              onChange={(e) => setTo(e.target.value)}
              className="outline-none text-gray-700"
            />
          </div>
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <ReportStatCard
          label="Total Revenue"
          value={summaryLoading ? "—" : formatKES(summary?.totalRevenue ?? 0)}
          changePct={summary?.revenueChangePct ?? 0}
          comparisonLabel={comparisonLabel}
          iconBg="#EFF6FF"
          icon={
            <svg width="18" height="18" fill="none" stroke="#2563EB" strokeWidth="1.8" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <ReportStatCard
          label="Total Payments"
          value={summaryLoading ? "—" : formatKES(summary?.totalPayments ?? 0)}
          changePct={summary?.paymentsChangePct ?? 0}
          comparisonLabel={comparisonLabel}
          iconBg="#ECFDF5"
          icon={
            <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
          }
        />
        <ReportStatCard
          label="Total Invoices"
          value={summaryLoading ? "—" : String(summary?.totalInvoices ?? 0)}
          changePct={summary?.invoicesChangePct ?? 0}
          comparisonLabel={comparisonLabel}
          iconBg="#FFF7ED"
          icon={
            <svg width="18" height="18" fill="none" stroke="#EA580C" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <ReportStatCard
          label="Outstanding Amount"
          value={summaryLoading ? "—" : formatKES(summary?.outstandingAmount ?? 0)}
          changePct={summary?.outstandingChangePct ?? 0}
          comparisonLabel={comparisonLabel}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Revenue Overview</h2>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as ReportGranularity)}
              className="px-2.5 py-1.5 text-xs border border-gray-200 bg-white rounded-lg outline-none text-gray-700"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          {revenueLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `KES ${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip formatter={(value) => formatKES(Number(value))} />                
                    <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Revenue (KES)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Payments by Method</h2>
          {methodLoading ? (
            <ChartSkeleton />
          ) : (methodData ?? []).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">No payment data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={methodData}
                    dataKey="amount"
                    nameKey="method"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {(methodData ?? []).map((entry) => (
                      <Cell key={entry.method} fill={methodColor(entry.method)} />
                    ))}
                  </Pie>
                <Tooltip formatter={(value) => formatKES(Number(value))} />                

                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-2">
                {(methodData ?? []).map((m) => (
                  <div key={m.method} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: methodColor(m.method) }} />
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">{methodLabel(m.method)}</div>
                      <div className="text-gray-500">
                        {formatKES(m.amount)} ({m.percentage.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Top Customers by Revenue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoices</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid Amount</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Outstanding</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topCustomersLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : (topCustomers ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    No customer activity in this period
                  </td>
                </tr>
              ) : (
                (topCustomers ?? []).map((c) => (
                  <tr key={c.customerNo} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/dashboard/customers/${c.customerNo}`}
                        className="font-semibold text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {c.customerNo}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{c.invoiceCount}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{formatKES(c.paidAmount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{formatKES(c.outstandingAmount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {c.lastPaymentDate ? formatDate(c.lastPaymentDate) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-gray-100 text-center">
          <Link to="/dashboard/customers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all customers
          </Link>
        </div>
      </div>
    </div>
  );
}