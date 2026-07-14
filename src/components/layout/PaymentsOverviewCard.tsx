import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { usePaymentsByMethod } from "../../hooks/useReports";
import { formatKES } from "../../lib/format";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

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

export function PaymentsOverviewCard() {
  const filterParams = { from: daysAgoISO(30), to: todayISO() };
  const { data: methodData, isLoading } = usePaymentsByMethod(filterParams);

  const total = (methodData ?? []).reduce((sum, m) => sum + m.amount, 0);
  const formattedTotal = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : formatKES(total);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Payments Overview</h2>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Loading…</div>
      ) : (methodData ?? []).length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No payment data</div>
      ) : (
        <div className="flex-1 flex items-center gap-4 p-5">
          <div className="relative w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  dataKey="amount"
                  nameKey="method"
                  innerRadius={42}
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {(methodData ?? []).map((entry) => (
                    <Cell key={entry.method} fill={methodColor(entry.method)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatKES(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-gray-400">KES</p>
              <p className="text-base font-bold text-gray-900 leading-tight">{formattedTotal}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 min-w-0">
            {(methodData ?? []).map((m) => (
              <div key={m.method} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: methodColor(m.method) }}
                />
                <div className="text-xs min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{methodLabel(m.method)}</div>
                  <div className="text-gray-500">
                    {formatKES(m.amount)} ({m.percentage.toFixed(0)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
