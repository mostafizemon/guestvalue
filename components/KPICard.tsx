import { ArrowUp } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export function KPICard({ label, value, icon, trend }: KPICardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[#6C757D] text-sm font-semibold">{label}</h3>
        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[#C09A51]">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-[#212529] mb-3">{value}</div>
      {trend ? (
        <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
          <ArrowUp size={12} strokeWidth={3} />
          <span>{trend} vs semaine dernière</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
          <ArrowUp size={12} strokeWidth={3} />
          <span>+ 15% vs semaine dernière</span>
        </div>
      )}
    </div>
  );
}
