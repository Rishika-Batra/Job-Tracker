'use client';

import React from 'react';
import { Job } from '@/lib/types';
import {
  Briefcase,
  MessageSquare,
  Gift,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface InlineStatsProps {
  jobs: Job[];
}

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;      // gradient from
  colorTo: string;    // gradient to
  iconBg: string;
}

export default function InlineStats({ jobs }: InlineStatsProps) {
  const total = jobs.length;
  const interviews = jobs.filter((j) => j.status === 'interview').length;
  const offers = jobs.filter((j) => j.status === 'offer').length;
  const rejections = jobs.filter((j) => j.status === 'rejected').length;
  const responded = interviews + offers + jobs.filter((j) => j.status === 'accepted').length + rejections;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const stats: StatItem[] = [
    {
      label: 'Total Applications',
      value: total,
      icon: <Briefcase className="h-5 w-5" />,
      color: 'from-indigo-500/20',
      colorTo: 'to-violet-500/20',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      label: 'Interviews',
      value: interviews,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'from-amber-500/20',
      colorTo: 'to-orange-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    {
      label: 'Offers',
      value: offers,
      icon: <Gift className="h-5 w-5" />,
      color: 'from-emerald-500/20',
      colorTo: 'to-green-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      label: 'Rejections',
      value: rejections,
      icon: <XCircle className="h-5 w-5" />,
      color: 'from-rose-500/20',
      colorTo: 'to-red-500/20',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'from-sky-500/20',
      colorTo: 'to-cyan-500/20',
      iconBg: 'bg-sky-500/20 text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-br ${stat.color} ${stat.colorTo} p-4 transition-all duration-200 hover:border-slate-700 hover:scale-[1.02]`}
        >
          {/* Icon */}
          <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-3 ${stat.iconBg}`}>
            {stat.icon}
          </div>

          {/* Value */}
          <div className="text-2xl font-bold text-white leading-none mb-1">
            {stat.value}
          </div>

          {/* Label */}
          <div className="text-xs font-medium text-slate-400 tracking-wide">
            {stat.label}
          </div>

          {/* Decorative glow */}
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-white/[0.03] blur-xl" />
        </div>
      ))}
    </div>
  );
}
