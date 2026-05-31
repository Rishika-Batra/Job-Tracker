"use client";

import React from 'react';
import { Job } from '@/lib/types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import JobCard from './JobCard';

interface KanbanColumnProps {
  status: string;
  jobs: Job[];
}

export default function KanbanColumn({ status, jobs }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const getColumnStyles = (colStatus: string) => {
    switch (colStatus) {
      case 'applied':
        return {
          title: 'Applied',
          textClass: 'text-blue-400',
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          borderClass: 'border-blue-500/20',
          activeBg: 'bg-blue-500/5',
        };
      case 'interview':
        return {
          title: 'Interview',
          textClass: 'text-amber-400',
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          borderClass: 'border-amber-500/20',
          activeBg: 'bg-amber-500/5',
        };
      case 'offer':
        return {
          title: 'Offer',
          textClass: 'text-emerald-400',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          borderClass: 'border-emerald-500/20',
          activeBg: 'bg-emerald-500/5',
        };
        case 'accepted':
          return {
            title: 'Accepted',
            textClass: 'text-teal-400',
            badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            borderClass: 'border-teal-500/20',
            activeBg: 'bg-teal-500/5',
          };
        case 'rejected':
          return {
            title: 'Rejected',
            textClass: 'text-rose-400',
            badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            borderClass: 'border-rose-500/20',
            activeBg: 'bg-rose-500/5',
          };
        default:
          return {
            title: status,
            textClass: 'text-slate-400',
            badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            borderClass: 'border-slate-500/20',
            activeBg: 'bg-slate-500/5',
          };
    }
  };

  const colStyle = getColumnStyles(status);

  return (
    <div className="flex flex-col w-full min-w-[280px] bg-slate-900/15 border border-slate-800/80 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight ${colStyle.textClass}`}>{colStyle.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${colStyle.badgeClass}`}>{jobs.length}</span>
        </div>
      </div>

      {/* Content */}
      <SortableContext items={jobs.map((job) => job.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 flex flex-col gap-3 min-h-[500px] rounded-xl p-2 transition-all duration-200 ${
            isOver ? `${colStyle.activeBg} border border-dashed ${colStyle.borderClass}` : 'border border-transparent'
          }`}
        >
          {jobs.length === 0 ? (
            <div className={`flex-1 flex items-center justify-center text-center p-6 rounded-xl ${isOver ? 'border-dashed' : ''} ${isOver ? `${colStyle.activeBg} ${colStyle.borderClass}` : 'border border-dashed border-slate-800/50'}`}> 
              <span className="text-sm text-slate-500 font-medium">
                {isOver ? 'Drop here' : 'No jobs here. Drag card to change status'}
              </span>
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
