"use client";

import React from "react";
import Link from "next/link";
import { useUserJobs } from "@/hooks/useUserJobs";
import StatsCard from "@/components/StatsCard";
import StatusPieChart from "@/components/StatusPieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import ApplicationsLineChart from "@/components/ApplicationsLineChart";
import { Job } from "@/lib/types";

function computeStats(jobs: Job[]) {
  const total = jobs.length;

  const applied = jobs.filter(
    (j) => j.status === "applied"
  ).length;

  const interview = jobs.filter(
    (j) => j.status === "interview"
  ).length;

  const offer = jobs.filter(
    (j) => j.status === "offer"
  ).length;

  const accepted = jobs.filter(
    (j) => j.status === "accepted"
  ).length;

  const rejected = jobs.filter(
    (j) => j.status === "rejected"
  ).length;

  const responded =
    interview + offer + accepted + rejected;

  const responseRate = total
    ? Math.round((responded / total) * 100)
    : 0;

  const offerRate = total
    ? Math.round((offer / total) * 100)
    : 0;

  const acceptanceRate = total
    ? Math.round((accepted / total) * 100)
    : 0;

  return {
    total,
    applied,
    interview,
    offer,
    accepted,
    rejected,
    responseRate,
    offerRate,
    acceptanceRate,
  };
}

export default function DashboardPage() {
  const { jobs, loading } = useUserJobs();

  const stats = computeStats(jobs);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Dashboard
          </h1>

          <p className="text-slate-400 mt-1">
            Track your application performance
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 bg-slate-900 px-5 py-3 rounded-xl border border-slate-800">
          <Link
            href="/"
            className="text-slate-300 hover:text-white transition"
          >
            Board
          </Link>

          <Link
            href="/dashboard"
            className="text-indigo-400 font-semibold"
          >
            Dashboard
          </Link>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        <StatsCard
          title="Total Applications"
          value={stats.total}
          bgClass="bg-indigo-600"
        />

        <StatsCard
          title="Applied"
          value={stats.applied}
          bgClass="bg-blue-600"
        />

        <StatsCard
          title="Interviews"
          value={stats.interview}
          bgClass="bg-amber-600"
        />

        <StatsCard
          title="Offers"
          value={stats.offer}
          bgClass="bg-emerald-600"
        />

        <StatsCard
          title="Accepted"
          value={stats.accepted}
          bgClass="bg-cyan-600"
        />

        <StatsCard
          title="Rejected"
          value={stats.rejected}
          bgClass="bg-rose-600"
        />

        <StatsCard
          title="Response Rate"
          value={stats.responseRate}
          unit="%"
          bgClass="bg-sky-600"
        />

        <StatsCard
          title="Offer Rate"
          value={stats.offerRate}
          unit="%"
          bgClass="bg-lime-600"
        />

        <StatsCard
          title="Acceptance Rate"
          value={stats.acceptanceRate}
          unit="%"
          bgClass="bg-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-5 text-slate-200">
            Status Distribution
          </h2>

          <StatusPieChart jobs={jobs} />
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-5 text-slate-200">
            Monthly Applications
          </h2>

          <MonthlyBarChart jobs={jobs} />
        </div>

        {/* Line Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg lg:col-span-2">
          <h2 className="text-lg font-semibold mb-5 text-slate-200">
            Application Trends
          </h2>

          <ApplicationsLineChart jobs={jobs} />
        </div>
      </div>
    </div>
  );
}