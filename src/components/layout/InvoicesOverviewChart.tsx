import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRevenueChart } from "../../hooks/useReports";
import { formatKES, todayISO, daysAgoISO, firstOfMonthISO, formatShortDate } from "../../lib/format";
import type { ReportGranularity } from "../../types/report";

type Period = "week" | "month" | "quarter";

const PERIOD_LABELS: Record<Period, string> = {
  week: "This Week",
  month: "This Month",
  quarter: "Last 3 Months",
};

function getPeriodRange(period: Period): { from: string; to: string; granularity: ReportGranularity } {
  const to = todayISO();
  switch (period) {
    case "week":
      return { from: daysAgoISO(6), to, granularity: "DAILY" };
    case "month":
      return { from: firstOfMonthISO(), to, granularity: "DAILY" };
    case "quarter":
      return { from: daysAgoISO(89), to, granularity: "WEEKLY" };
  }
}

function ChartSkeleton() {
  return <div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading chart…</div>;
}

export function InvoicesOverviewChart() {
  const [period, setPeriod] = useState<Period>("month");
  const { from, to, granularity } = getPeriodRange(period);

  const { data: revenueData, isLoading } = useRevenueChart({ from, to, granularity });

  const chartData = (revenueData ?? []).map((p) => ({
    date: formatShortDate(p.bucketDate),
    amount: p.amount,
  }));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Invoices Overview</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="px-2.5 py-1.5 text-xs border border-gray-200 bg-white rounded-lg outline-none text-gray-700"
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => (
            <option key={key} value={key}>
              {PERIOD_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">No invoice data yet</div>
      ) : (
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="invoicesOverviewFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip formatter={(value) => formatKES(Number(value))} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#invoicesOverviewFill)"
                dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                name="Revenue (KES)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}