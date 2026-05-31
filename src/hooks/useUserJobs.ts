// src/hooks/useUserJobs.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/lib/types";

/**
 * Hook that returns the current authenticated user's jobs.
 * It handles loading, error and provides a refetch function.
 */
export function useUserJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select<string, Job>("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setJobs(data ?? []);
    } catch (error) {
      const e = error as Error;
      console.error(e);
      setError(e.message ?? "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Subscribe to auth changes to auto‑refresh when user signs in/out
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchJobs();
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { jobs, loading, error, refetch: fetchJobs };
}
