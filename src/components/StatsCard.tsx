import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  /** Optional unit such as "%" or "days" */
  unit?: string;
  /** Optional Tailwind background color class (e.g., "bg-indigo-600").
   *  If omitted a default gradient is used. */
  bgClass?: string;
}

export default function StatsCard({ title, value, unit, bgClass }: StatsCardProps) {
  return (
    <div className={`p-6 rounded-xl text-white shadow-md ${bgClass ?? 'bg-gradient-to-br from-indigo-600 to-violet-600'} transition-transform hover:scale-[1.02]`}> 
      <div className="text-sm font-medium text-slate-200 opacity-80">{title}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold leading-none">{value}</span>
        {unit && <span className="text-lg font-medium text-slate-300">{unit}</span>}
      </div>
    </div>
  );
}
