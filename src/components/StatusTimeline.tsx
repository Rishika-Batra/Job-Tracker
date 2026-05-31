
"use client";

import { format } from "date-fns";

import { Status } from '@/lib/types';

export interface HistoryItem {
  id: string;
  old_status: Status | null;
  new_status: Status;
  changed_at: string; // ISO timestamp
}

export default function StatusTimeline({ history }: { history: HistoryItem[] }) {
  // Ensure chronological order (oldest → newest)
  const sorted = [...history].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  );

  return (
    <div className="relative ml-6 border-l border-slate-600/50">
      {sorted.map((h) => (
        <div key={h.id} className="mb-8 pl-4">
          {/* Circle */}
          <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 border-2 border-slate-950">
            <div className="h-2 w-2 rounded-full bg-slate-100" />
          </div>

          {/* Content */}
          <p className="text-sm font-medium text-slate-200">
            {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
          </p>
          <p className="text-xs text-slate-500">
            {format(new Date(h.changed_at), "PPP")}
          </p>
        </div>
      ))}
    </div>
  );
}
