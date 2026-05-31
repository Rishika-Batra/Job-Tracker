import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type SortOption = 'newest' | 'oldest' | 'company';

interface JobFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  status: string; // single status filter, '' means all
  setStatus: (value: string) => void;
  sort: SortOption;
  setSort: (value: SortOption) => void;
}

/**
 * UI component placed above the Kanban board.
 * It updates URL query params and persists the state in localStorage.
 * All styling follows the existing dark Tailwind theme.
 */
export default function JobFilters({
  search,
  setSearch,
  status,
  setStatus,
  sort,
  setSort,
}: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync UI changes to URL + localStorage
  const sync = () => {
    const params = new URLSearchParams(searchParams);
    if (search) params.set('search', search);
    else params.delete('search');
    if (status) params.set('status', status);
    else params.delete('status');
    if (sort) params.set('sort', sort);
    else params.delete('sort');
    router.replace(`?${params.toString()}`);
    // Persist for next loads (fallback if URL is cleared)
    localStorage.setItem('jobFilters', JSON.stringify({ search, status, sort }));
  };

  // Whenever any filter changes, push to URL/localStorage
  useEffect(() => {
    sync();
  }, [search, status, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Input handlers
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const onSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOption);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search by company or role…"
          value={search}
          onChange={onSearchChange}
          className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
          🔍
        </span>
      </div>

      {/* Status filter */}
      <select
        value={status}
        onChange={onStatusChange}
        className="rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All statuses</option>
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="offer">Offer</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={onSortChange}
        className="rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="company">Company (A‑Z)</option>
      </select>
    </div>
  );
}
