'use client';

import { Job } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { ExternalLink, GripVertical } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const getStatusStyles = (status: Job['status']) => {
    switch (status) {
      case 'applied':
        return {
          bg: 'bg-indigo-500/15',
          text: 'text-indigo-400',
          border: 'border-indigo-500/20',
          indicator: 'bg-indigo-500',
        };
      case 'interview':
        return {
          bg: 'bg-violet-500/15',
          text: 'text-violet-400',
          border: 'border-violet-500/20',
          indicator: 'bg-violet-500',
        };
      case 'offer':
        return {
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          indicator: 'bg-emerald-500',
        };
      case 'rejected':
        return {
          bg: 'bg-rose-500/15',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          indicator: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-500/15',
          text: 'text-slate-400',
          border: 'border-slate-500/20',
          indicator: 'bg-slate-500',
        };
    }
  };

  const statusStyle = getStatusStyles(job.status);

  // Format date: e.g. "May 27, 2026"
  const formattedDate = new Date(job.applied_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC', // Ensure consistent date display independent of browser timezone
  });

  const handleCardClick = () => {
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={`group relative flex items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-900/60 backdrop-blur-md cursor-pointer transition-all duration-200 hover:border-slate-700 select-none shadow-md ${
        isDragging ? 'shadow-2xl ring-2 ring-indigo-500/40' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 flex-shrink-0" />
        </div>

        {/* Content */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 truncate group-hover:text-white transition-colors">
              {job.company}
            </span>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded"
                title="Open job posting"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <p className="text-sm text-slate-400 truncate">{job.role}</p>
          <p className="text-xs text-slate-500">Applied: {formattedDate}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.indicator}`} />
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>
    </div>
  );
}
