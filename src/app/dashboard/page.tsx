"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUserJobs } from "@/hooks/useUserJobs";
import StatsCard from "@/components/StatsCard";
import StatusPieChart from "@/components/StatusPieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import ApplicationsLineChart from "@/components/ApplicationsLineChart";
import { Job } from "@/lib/types";
import { Sparkles, ArrowRight } from "lucide-react";

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
  const [interviewPrepScores, setInterviewPrepScores] = useState<Record<string, number>>({});

  const stats = computeStats(jobs);

  // Compute prep scores for interview status jobs from localStorage
  useEffect(() => {
    if (loading || !jobs) return;
    const scores: Record<string, number> = {};
    const interviewJobs = jobs.filter((j) => j.status === 'interview');
    
    interviewJobs.forEach((job) => {
      const saved = localStorage.getItem(`prep_${job.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const answers = (parsed.answers || {}) as Record<string, string>;
          const researchChecked = (parsed.researchChecked || {}) as Record<string, boolean>;
          const viewedTalkingPoints = !!parsed.viewedTalkingPoints;
          
          const savedAnswersCount = Object.values(answers).filter((val) => val.trim().length > 0).length;
          const researchDoneCount = Object.values(researchChecked).filter(Boolean).length;
          
          const points = (savedAnswersCount * 20) + (researchDoneCount * 10) + (viewedTalkingPoints ? 10 : 0);
          const score = Math.min(100, Math.round((points / 140) * 100));
          scores[job.id] = score;
        } catch (e) {
          console.error('Failed to parse saved prep data:', e);
          scores[job.id] = 0;
        }
      } else {
        scores[job.id] = 0;
      }
    });
    setInterviewPrepScores(scores);
  }, [jobs, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  const interviewJobs = jobs.filter((j) => j.status === 'interview');
  const xCount = interviewJobs.length;
  const yCount = interviewJobs.filter((j) => (interviewPrepScores[j.id] || 0) > 70).length;

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

      {/* Interview Readiness Section */}
      <section className="mb-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-650/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" /> Interview Readiness
            </h2>
            <p className="text-xs text-slate-450 mt-1">
              {xCount === 0 ? (
                "No interviews scheduled. Keep applying to land your next interview!"
              ) : (
                <span className="font-medium text-slate-300">
                  {xCount} interviews coming up. <span className="text-emerald-400 font-bold">{yCount} fully prepped</span>.
                  {yCount === xCount ? " Outstanding work! You're ready to crush all of them! 🚀" : " Keep practicing to build your confidence! 💪"}
                </span>
              )}
            </p>
          </div>
        </div>

        {interviewJobs.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
            No upcoming interviews scheduled yet. Move a job to the &ldquo;Interview&rdquo; status on your board to start prep.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviewJobs.map((job) => {
              const score = interviewPrepScores[job.id] || 0;
              
              let badgeText = "Not prepped";
              let badgeClass = "bg-rose-500/10 text-rose-450 border border-rose-500/20";
              let buttonText = "Start Prep";
              let buttonClass = "bg-rose-600 hover:bg-rose-550 text-white";

              if (score > 70) {
                badgeText = "Ready";
                badgeClass = "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20";
                buttonText = "View Prep";
                buttonClass = "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700";
              } else if (score > 0) {
                badgeText = "Getting there";
                badgeClass = "bg-amber-500/10 text-amber-450 border border-amber-500/20";
                buttonText = "Continue Prep";
                buttonClass = "bg-amber-600 hover:bg-amber-500 text-white";
              }

              return (
                <div 
                  key={job.id} 
                  className="border border-slate-800 rounded-xl bg-slate-950/40 p-4 flex flex-col justify-between hover:border-slate-700/60 transition group shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-200 truncate text-sm">
                        {job.company}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass} shrink-0`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{job.role}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center gap-3">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Prep Score: <span className="text-slate-300">{score}%</span>
                      </span>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            score === 0 ? 'bg-slate-700' : score > 70 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 active:scale-95 shrink-0 ${buttonClass}`}
                    >
                      {buttonText} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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