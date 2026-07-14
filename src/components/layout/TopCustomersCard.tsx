import { Link } from "react-router-dom";
import { useTopCustomers } from "../../hooks/useReports";
import { formatKES, formatDate } from "../../lib/format";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function TableSkeleton() {
  return (
    <div className="p-5 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-12" />
          <div className="h-3 bg-gray-100 rounded w-20 ml-auto" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

export function TopCustomersCard() {
  const filterParams = { from: daysAgoISO(30), to: todayISO() };
  const { data: topCustomers, isLoading } = useTopCustomers(filterParams, 4);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Top Customers</h2>
        <Link to="/dashboard/customers" className="text-sm text-blue-600 hover:text-blue-700">
          View all
        </Link>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (topCustomers ?? []).length === 0 ? (
        <div className="p-8 flex-1 flex items-center justify-center text-center text-sm text-gray-400">
          No customer activity in the last 30 days
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Invoices
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Paid Amount
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Outstanding
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Last Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(topCustomers ?? []).map((c) => (
                <tr key={c.customerNo} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link
                      to={`/dashboard/customers/${c.customerNo}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {c.customerNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{c.invoiceCount}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">
                    {formatKES(c.paidAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">
                    {formatKES(c.outstandingAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400">
                    {c.lastPaymentDate ? formatDate(c.lastPaymentDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
