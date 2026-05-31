import React from 'react';
import { format, isToday, isPast, parseISO } from 'date-fns';

type FollowUpBadgeProps = {
  /** ISO date string of the follow‑up */
  followUpDate: string | null;
  /** Whether the reminder is enabled */
  enabled: boolean;
};

/**
 * Returns a Tailwind‑styled badge that reflects the reminder status.
 * - Overdue (red)   – date is before today
 * - Today   (amber) – date is today
 * - Upcoming (indigo) – date is in the future
 * - Disabled (gray) – reminder not enabled
 */
export default function FollowUpBadge({ followUpDate, enabled }: FollowUpBadgeProps) {
  if (!enabled || !followUpDate) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-200">
        Disabled
      </span>
    );
  }

  const date = parseISO(followUpDate);

  let bg = 'bg-indigo-600';
  let label = 'Upcoming';
  if (isToday(date)) {
    bg = 'bg-amber-500';
    label = 'Today';
  } else if (isPast(date) && !isToday(date)) {
    bg = 'bg-rose-600';
    label = 'Overdue';
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg} text-white`}>
      {label} – {format(date, 'MMM d')}
    </span>
  );
}
