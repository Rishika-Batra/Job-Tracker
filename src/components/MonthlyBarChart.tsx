import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Job } from '../lib/types';

interface MonthlyBarChartProps {
  jobs: Job[];
}

export default function MonthlyBarChart({ jobs }: MonthlyBarChartProps) {
  const sortedData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job) => {
      if (job.created_at) {
        const date = new Date(job.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .sort()
      .map((key) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          name: `${date.toLocaleString('default', { month: 'short' })} ${year}`,
          applications: counts[key],
        };
      });
  }, [jobs]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
          itemStyle={{ color: '#6366f1' }}
          cursor={{ fill: '#334155', opacity: 0.4 }}
        />
        <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
