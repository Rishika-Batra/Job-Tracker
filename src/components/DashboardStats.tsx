import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import { Job } from '@/lib/types';

interface Stats {
  total: number;
  interview: number;
  offer: number;
  rejected: number;
  responseRate: number; // percentage
  offerRate: number; // percentage
  avgResponseTime: number; // days
}

export default function DashboardStats() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const computeStats = (jobs: Job[]): Stats => {
    const total = jobs.length;
    const interview = jobs.filter((j) => j.status === 'interview').length;
    const offer = jobs.filter((j) => j.status === 'offer').length;
    const rejected = jobs.filter((j) => j.status === 'rejected').length;
    const responded = interview + offer + rejected; // any status beyond "applied"
    const responseRate = total ? Math.round((responded / total) * 100) : 0;
    const offerRate = total ? Math.round((offer / total) * 100) : 0;
    // Average time to first response (in days) for responded jobs
    const responseTimes = jobs
      .filter((j) => j.status !== 'applied' && j.applied_date && j.updated_at)
      .map((j) => {
        const applied = new Date(j.applied_date);
        const updated = new Date(j.updated_at);
        const diff = (updated.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
        return diff;
      });
    const avgResponseTime = responseTimes.length
      ? Math.round(
          responseTimes.reduce((sum, d) => sum + d, 0) / responseTimes.length
        )
      : 0;
    return { total, interview, offer, rejected, responseRate, offerRate, avgResponseTime };
  };

  const stats = computeStats(jobs);

  if (loading) {
    // Simple skeleton UI with pulse animation
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-slate-800/50"
          ></div>
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="p-8 text-center text-slate-400">
        No job applications yet. Add a job to see analytics.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Total Applications" value={stats.total} bgClass="bg-indigo-600" />
      <StatsCard title="Interviews" value={stats.interview} bgClass="bg-amber-600" />
      <StatsCard title="Offers" value={stats.offer} bgClass="bg-emerald-600" />
      <StatsCard title="Rejections" value={stats.rejected} bgClass="bg-rose-600" />
      <StatsCard title="Response Rate" value={stats.responseRate} unit="%" bgClass="bg-sky-600" />
      <StatsCard title="Offer Rate" value={stats.offerRate} unit="%" bgClass="bg-lime-600" />
      <StatsCard title="Avg. Time to Response" value={stats.avgResponseTime} unit="days" bgClass="bg-fuchsia-600" />
    </div>
  );
}
