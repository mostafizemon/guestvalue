import { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
}

export function KPICard({ label, value, icon, trend }: KPICardProps) {
  return (
    <div className="bg-[#292524] border border-[#44403C] rounded-xl p-5 hover:-translate-y-[2px] transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[#78716C] text-sm font-medium">{label}</p>
        <div className="text-[#d4a853] w-5 h-5">{icon}</div>
      </div>
      <h3 className="text-white text-[28px] font-bold">{value}</h3>
      {trend && (
        <p className={`text-sm mt-1 ${trend.startsWith('+') ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}
