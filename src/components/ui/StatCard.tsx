interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  subtext?: string;
  changePct?: number;
  comparisonLabel?: string;
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

export function StatCard({ label, value, icon, iconBg, subtext, changePct, comparisonLabel }: StatCardProps) {
  if (changePct !== undefined && comparisonLabel !== undefined) {
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-start gap-4 shadow-sm">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <p className="text-base font-bold text-gray-900 leading-none">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
