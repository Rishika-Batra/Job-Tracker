'use client';

import React, { useState, useEffect } from 'react';
import { Status, Job } from '@/lib/types';
import KanbanBoard from '@/components/KanbanBoard';
import InlineStats from '@/components/InlineStats';
import AddJobModal from '@/components/AddJobModal';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, LogOut, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardPage() {
  const pathname = usePathname();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch logged in user email and jobs on component load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Fetch user session
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email ?? 'Authenticated User');
        }

        // 2. Fetch jobs
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to load initial dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle optimistic update for status changes
  const handleStatusChange = async (jobId: string, newStatus: Status) => {
    // Keep reference of original jobs for rollback on failure
    const originalJobs = [...jobs];

    // Optimistically update the status of the target job
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : job
      )
    );

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error('[status update] server error:', errorBody);
        throw new Error(errorBody?.error ?? 'Failed to update status on server');
      }
    } catch (err) {
      console.error('[status update] rolled back:', err);
      // Rollback to original state on error
      setJobs(originalJobs);
    }
  };

  const handleJobAdded = (newJob: Job) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
  };

  const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-xl" />
          <div className="h-4 w-72 bg-slate-800 rounded-lg" />
        </div>
        <div className="h-10 w-28 bg-slate-850 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[1, 2, 3, 4].map((col) => (
          <div
            key={col}
            className="bg-slate-900/10 border border-slate-800/60 rounded-2xl p-4 space-y-4 min-h-[500px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
              <div className="h-5 w-24 bg-slate-800 rounded-lg" />
              <div className="h-5 w-8 bg-slate-800 rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="p-4 rounded-xl border border-slate-850 bg-slate-900/20 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 w-2/3">
                      <div className="h-4 bg-slate-800 rounded w-5/6" />
                      <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-16 bg-slate-850 rounded-full" />
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Premium Header */}
      <header className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/10">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                JobTracker
              </span>
            </div>
            {/* Navigation links */}
            <nav className="flex gap-4">
              <Link href="/" className={`text-sm text-slate-300 hover:text-white ${pathname === '/' ? 'font-semibold text-white' : ''}`}>Board</Link>
              <Link href="/dashboard" className={`text-sm text-slate-300 hover:text-white ${pathname === '/dashboard' ? 'font-semibold text-white' : ''}`}>Dashboard</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="hidden md:inline text-sm text-slate-400">
                Logged in as: <strong className="text-indigo-400 font-semibold">{userEmail}</strong>
              </span>
            )}
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-sm font-medium text-slate-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Board Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-8 flex-1 flex flex-col">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-105 to-slate-400 bg-clip-text text-transparent">
                  Job Applications
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Track and organize your job applications, interviews, and offers.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all self-start sm:self-center"
              >
                <Plus className="h-4 w-4" />
                <span>Add Job</span>
              </button>
            </div>

            {/* Kanban Board Area */}
            {jobs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/10">
                <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4 animate-bounce">
                  <Sparkles className="h-8 w-8 text-indigo-500/85" />
                </div>
                <h3 className="font-bold text-lg text-slate-200">No applications yet</h3>
                <p className="text-slate-400 text-sm max-w-sm mt-1 mb-6">
                  Get started by adding your first job application. Track roles, updates, and more.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Application</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                {/* Analytics Stats */}
                <InlineStats jobs={jobs} />

                <KanbanBoard jobs={jobs} onStatusChange={handleStatusChange} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <AddJobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onJobAdded={handleJobAdded}
      />
    </div>
  );
}
