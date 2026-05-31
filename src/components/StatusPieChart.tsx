import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Job, Status } from '../lib/types';

interface StatusPieChartProps {
  jobs: Job[];
}

const statusColors: Record<Status, string> = {
  applied: '#6366f1', // indigo-500
  interview: '#f59e0b', // amber-500
  offer: '#10b981', // emerald-500
  accepted: '#06b6d4', // cyan-500
  rejected: '#f43f5e', // rose-500
};

export default function StatusPieChart({ jobs }: StatusPieChartProps) {
  const statusCounts = (['applied', 'interview', 'offer', 'accepted', 'rejected'] as Status[]).map((status) => ({
    name: status,
    value: jobs.filter((j) => j.status === status).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={statusCounts}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => {
            const p = typeof percent === 'number' ? percent : 0;
            return `${name} ${(p * 100).toFixed(0)}%`;
          }}
        >
          {statusCounts.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={statusColors[entry.name as Status]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
