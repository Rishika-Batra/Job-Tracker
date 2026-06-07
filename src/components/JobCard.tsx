'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Job } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { ExternalLink, GripVertical } from 'lucide-react';
import InterviewPrepButton from './InterviewPrepButton';
import InterviewPrepModal from './InterviewPrepModal';

interface JobCardProps {
  job: Job;
}

type PrepData = {
  questions: string[];
  research: string[];
  talkingPoints: string[];
  smartQuestion: string;
  generatedAt?: number;
};

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

  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [hasPrepData, setHasPrepData] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`prep_${job.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PrepData;
        setPrepData(parsed);
        setHasPrepData(true);
      } catch (e) {
        console.error('Failed to parse saved prep data:', e);
      }
    }
  }, [job.id]);

  const handlePrepReady = (data: PrepData) => {
    const dataWithTimestamp = { ...data, generatedAt: Date.now() };
    localStorage.setItem(`prep_${job.id}`, JSON.stringify(dataWithTimestamp));
    setPrepData(dataWithTimestamp);
    setHasPrepData(true);
    setIsModalOpen(true);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: job.company,
          role: job.role,
          notes: job.notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to regenerate prep data');
      const data = await response.json();
      const dataWithTimestamp = { ...data, generatedAt: Date.now() };
      localStorage.setItem(`prep_${job.id}`, JSON.stringify(dataWithTimestamp));
      setPrepData(dataWithTimestamp);
      setHasPrepData(true);
    } catch (e) {
      console.error(e);
      alert('Error regenerating prep details. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const getStatusStyles = (status: Job['status']) => {
    switch (status) {
      case 'applied':
        return { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/20', indicator: 'bg-indigo-500' };
      case 'interview':
        return { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/20', indicator: 'bg-violet-500' };
      case 'offer':
        return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20', indicator: 'bg-emerald-500' };
      case 'rejected':
        return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/20', indicator: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/20', indicator: 'bg-slate-500' };
    }
  };

  const statusStyle = getStatusStyles(job.status);

  const formattedDate = new Date(job.applied_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => router.push(`/jobs/${job.id}`)}
        className={`group relative flex flex-col p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-900/60 backdrop-blur-md cursor-pointer transition-all duration-200 hover:border-slate-700 select-none shadow-md ${
          isDragging ? 'shadow-2xl ring-2 ring-indigo-500/40' : ''
        }`}
      >
        <div className="flex items-center justify-between w-full min-w-0 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 cursor-grab active:cursor-grabbing transition-colors"
            >
              <GripVertical className="h-4 w-4 flex-shrink-0" />
            </div>

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
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <p className="text-sm text-slate-400 truncate">{job.role}</p>
              <p className="text-xs text-slate-500">Applied: {formattedDate}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.indicator}`} />
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            {hasPrepData && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Prepped
              </span>
            )}
          </div>
        </div>

        <div className="w-full mt-2" onClick={(e) => e.stopPropagation()}>
          {hasPrepData ? (
            <button
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
              className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-lg shadow-sm border border-slate-700/80 text-xs transition duration-150 active:scale-[0.98]"
            >
              🔍 View Prep
            </button>
          ) : (
            <InterviewPrepButton
              company={job.company}
              role={job.role}
              notes={job.notes}
              onPrepReady={handlePrepReady}
            />
          )}
        </div>
      </div>

      {mounted && isModalOpen && prepData &&
        createPortal(
          <InterviewPrepModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            company={job.company}
            role={job.role}
            prepData={prepData}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />,
          document.body
        )
      }
    </>
  );
}