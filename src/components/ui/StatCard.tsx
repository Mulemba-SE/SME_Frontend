interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export function StatCard({ label, value, subtext, icon, iconBg }: StatCardProps) {
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
