'use client';

import React, { useState } from 'react';

type InterviewPrepButtonProps = {
  company: string;
  role: string;
  notes?: string | null;
  onPrepReady: (data: {
    questions: string[];
    research: string[];
    talkingPoints: string[];
    smartQuestion: string;
  }) => void;
  onStartLoading?: () => void;
};

export default function InterviewPrepButton({
  company,
  role,
  notes,
  onPrepReady,
  onStartLoading,
}: InterviewPrepButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrep = async () => {
    setIsLoading(true);
    setError(null);
    if (onStartLoading) {
      onStartLoading();
    }
    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company, role, notes }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate interview prep details.');
      }

      const data = await response.json();
      onPrepReady(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={handlePrep}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform active:scale-95 disabled:from-violet-700/50 disabled:to-indigo-700/50 disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? (
          <span className="animate-pulse flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Preparing your prep...
          </span>
        ) : (
          <>
            <span className="mr-1.5">🎯</span> Interview Prep
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-rose-500 font-medium self-start">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
