'use client';

import React from 'react';

type PrepProgressBarProps = {
  savedAnswers: number; // 0 to 5
  researchDone: number; // 0 to 3
  viewedTalkingPoints: boolean;
};

export default function PrepProgressBar({
  savedAnswers = 0,
  researchDone = 0,
  viewedTalkingPoints = false,
}: PrepProgressBarProps) {
  // Points calculation
  const points = (savedAnswers * 20) + (researchDone * 10) + (viewedTalkingPoints ? 10 : 0);
  const maxPoints = 140;
  const score = Math.min(100, Math.round((points / maxPoints) * 100));

  // Determine styles and labels based on score
  let barColorClass = 'bg-rose-500';
  let label = 'Just started';
  let textColorClass = 'text-rose-400';

  if (score >= 30 && score <= 70) {
    barColorClass = 'bg-amber-500';
    label = 'Getting there';
    textColorClass = 'text-amber-400';
  } else if (score > 70) {
    barColorClass = 'bg-emerald-500';
    label = 'Ready to crush it';
    textColorClass = 'text-emerald-400';
  }

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-semibold">
          Prep Score: <span className={`text-sm font-bold ${textColorClass}`}>{score}%</span>
        </span>
        <span className={`font-bold uppercase tracking-wider text-[10px] ${textColorClass}`}>
          {label}
        </span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{savedAnswers}/5 Answers drafted</span>
        <span>{researchDone}/3 Researched</span>
      </div>
    </div>
  );
}
