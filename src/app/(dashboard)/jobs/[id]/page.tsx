"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import StatusTimeline, { HistoryItem } from "@/components/StatusTimeline";
import { supabase } from "@/lib/supabase";
import { Job } from "@/lib/types";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Server‑side fetch via Supabase client (client‑side here for simplicity)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get job
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", params.id)
          .single<Job>();
        if (jobError) throw jobError;
        setJob(jobData);

        // 2. Get status history (ordered oldest → newest)
        const { data: histData, error: histError } = await supabase
          .from("status_history")
          .select("id, old_status, new_status, changed_at")
          .eq("job_id", params.id)
          .order("changed_at", { ascending: true });
        if (histError) throw histError;
        setHistory(histData ?? []);
      } catch (e) {
        console.error(e);
        // If we cannot fetch (e.g., unauthenticated) redirect to dashboard
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Re‑run when id changes
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm("Delete this job permanently?")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", params.id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading job details…
      </div>
    );
  }

  if (!job) {
    return null; // Redirect handled earlier
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-300" />
        </button>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          {job.company} – {job.role}
        </h1>
        <button
          onClick={handleDelete}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </header>

      {/* Job meta */}
      <section className="mb-8 rounded-xl bg-slate-900/30 p-4 border border-slate-800/60">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-400">Company</dt>
            <dd className="font-medium text-slate-200">{job.company}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Role</dt>
            <dd className="font-medium text-slate-200">{job.role}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Applied</dt>
            <dd className="font-medium text-slate-200">
              {new Date(job.applied_date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </dd>
          </div>
          {job.url && (
            <div>
              <dt className="text-slate-400">Job link</dt>
              <dd>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  Open posting
                </a>
              </dd>
            </div>
          )}
          {job.notes && (
            <div className="col-span-2">
              <dt className="text-slate-400">Notes</dt>
              <dd className="text-slate-300 whitespace-pre-line">{job.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Status timeline */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-200">Status History</h2>
        {history.length ? (
          <StatusTimeline history={history} />
        ) : (
          <p className="text-slate-400">No status changes recorded yet.</p>
        )}
      </section>
    </div>
  );
}
