'use client';

import React, { useState, useEffect } from 'react';
import { Status, Job } from '@/lib/types';
import { X, Sparkles } from 'lucide-react';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: (job: Job) => void;
}

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AddJobModal({ isOpen, onClose, onJobAdded }: AddJobModalProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Status>('applied');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset fields when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setCompany('');
      setRole('');
      setUrl('');
      setAppliedDate(getTodayDateString());
      setNotes('');
      setStatus('applied');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      setError('Company and Role are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          url: url.trim() || null,
          applied_date: appliedDate,
          notes: notes.trim() || null,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add job application');
      }

      onJobAdded(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300"
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Add Job Application</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label htmlFor="company" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="company"
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Role Title */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Role / Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Applied Date */}
            <div className="space-y-1.5">
              <label htmlFor="appliedDate" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Applied Date
              </label>
              <input
                id="appliedDate"
                type="date"
                required
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Job URL */}
          <div className="space-y-1.5">
            <label htmlFor="url" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Job Posting URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://careers.google.com/jobs/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key notes, recruiter contact info, salary range, etc..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Modal Footer / Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-650 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Application</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
