import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Job } from '../lib/types';

interface ApplicationsLineChartProps {
  jobs: Job[];
}

export default function ApplicationsLineChart({ jobs }: ApplicationsLineChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job) => {
      if (job.created_at) {
        const date = new Date(job.created_at);
        const key = date.toISOString().split('T')[0];
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .sort()
      .map((key) => {
        const date = new Date(key);
        return {
          name: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`,
          applications: counts[key],
        };
      });
  }, [jobs]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
          itemStyle={{ color: '#38bdf8' }}
        />
        <Line type="monotone" dataKey="applications" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
