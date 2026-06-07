'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Mic,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ArrowLeft
} from 'lucide-react';

type PrepData = {
  questions: unknown[];
  research: unknown[];
  talkingPoints: unknown[];
  smartQuestion: unknown;
};

type InterviewPrepModalProps = {
  isOpen: boolean;
  onClose: () => void;
  company: string;
  role: string;
  prepData: PrepData | null;
  onRegenerate: () => void;
  isRegenerating?: boolean;
};

const toStr = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    return String(obj.desc || obj.text || obj.question || obj.point || JSON.stringify(val));
  }
  return String(val ?? '');
};

export default function InterviewPrepModal({
  isOpen,
  onClose,
  company,
  role,
  prepData,
  onRegenerate,
  isRegenerating = false,
}: InterviewPrepModalProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [researchChecked, setResearchChecked] = useState<Record<number, boolean>>({});
  const [copiedTalkingPoint, setCopiedTalkingPoint] = useState<number | null>(null);
  const [copiedSmartQuestion, setCopiedSmartQuestion] = useState(false);

  // Track prepData identity to detect regeneration
  const prevPrepDataRef = useRef<PrepData | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !prepData) return;

    // If prepData changed (regenerated), reset checkboxes and answers
    if (prevPrepDataRef.current !== prepData) {
      setResearchChecked({});
      setAnswers({});
      setExpandedQuestion(null);
      prevPrepDataRef.current = prepData;

      // Also clear localStorage for this job's research checkboxes
      prepData.research.forEach((_, idx) => {
        localStorage.removeItem(`interview-prep-r-${company}-${role}-${idx}`);
      });
    }

    // Load saved answers
    const loadedAnswers: Record<number, string> = {};
    prepData.questions.forEach((_, idx) => {
      const key = `interview-prep-q-${company}-${role}-${idx}`;
      const saved = localStorage.getItem(key);
      if (saved) loadedAnswers[idx] = saved;
    });
    setAnswers(loadedAnswers);

    // Load research checkboxes
    const loadedChecked: Record<number, boolean> = {};
    prepData.research.forEach((_, idx) => {
      const key = `interview-prep-r-${company}-${role}-${idx}`;
      const saved = localStorage.getItem(key);
      loadedChecked[idx] = saved === 'true';
    });
    setResearchChecked(loadedChecked);
  }, [isOpen, prepData, company, role]);

  if (!isOpen || !prepData) return null;

  // Calculate prep score
  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length;
  const researchCount = Object.values(researchChecked).filter(Boolean).length;
  const totalQuestions = prepData.questions.length;
  const totalResearch = prepData.research.length;
  const score = Math.round(
    ((answeredCount / Math.max(totalQuestions, 1)) * 60) +
    ((researchCount / Math.max(totalResearch, 1)) * 40)
  );
  const scoreColor = score < 30 ? 'bg-rose-500' : score < 70 ? 'bg-amber-500' : 'bg-emerald-500';
  const scoreLabel = score < 30 ? 'Just Started' : score < 70 ? 'Getting There' : 'Ready to Crush It 🔥';
  const scoreLabelColor = score < 30 ? 'text-rose-400' : score < 70 ? 'text-amber-400' : 'text-emerald-400';

  const handleAnswerChange = (idx: number, val: string) => {
    setAnswers(prev => ({ ...prev, [idx]: val }));
    localStorage.setItem(`interview-prep-q-${company}-${role}-${idx}`, val);
  };

  const handleResearchToggle = (idx: number) => {
    const newVal = !researchChecked[idx];
    setResearchChecked(prev => ({ ...prev, [idx]: newVal }));
    localStorage.setItem(`interview-prep-r-${company}-${role}-${idx}`, String(newVal));
  };

  const handleCopyText = (text: string, type: 'talkingPoint' | 'smartQuestion', idx?: number) => {
    navigator.clipboard.writeText(text);
    if (type === 'talkingPoint' && idx !== undefined) {
      setCopiedTalkingPoint(idx);
      setTimeout(() => setCopiedTalkingPoint(null), 2000);
    } else {
      setCopiedSmartQuestion(true);
      setTimeout(() => setCopiedSmartQuestion(false), 2000);
    }
  };

  const smartQuestionStr = toStr(prepData.smartQuestion);

  return (
    // Fix 2: overflow-hidden on outer, overflow-y-auto only on content — removes double scrollbar
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="animate-slide-in flex flex-col h-full w-full overflow-hidden">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition text-sm font-medium"
            >
              <ArrowLeft size={18} />
              Back to Board
            </button>
            <div className="w-px h-5 bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <h2 className="font-bold text-slate-100 text-sm leading-tight">Interview Prep</h2>
                <p className="text-xs text-slate-400">
                  {role} at <span className="text-violet-400 font-semibold">{company}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:text-slate-500 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw size={13} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-slate-900/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400">
              Prep Score: <span className={scoreLabelColor}>{score}%</span>
            </span>
            <span className={`text-xs font-bold ${scoreLabelColor}`}>{scoreLabel}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-slate-500">
            <span>{answeredCount}/{totalQuestions} Answers drafted</span>
            <span>{researchCount}/{totalResearch} Researched</span>
          </div>
        </div>

        {/* Content — only this div scrolls */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Questions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mic size={20} className="text-violet-400" />
                <h3 className="font-bold text-slate-200 text-base">Likely Questions</h3>
                <span className="text-xs text-slate-500 ml-auto">{answeredCount}/{totalQuestions} answered</span>
              </div>
              <div className="space-y-3">
                {prepData.questions.map((question, idx) => {
                  const questionStr = toStr(question);
                  const isExpanded = expandedQuestion === idx;
                  const hasAnswer = (answers[idx] || '').trim().length > 0;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden transition hover:border-slate-700/80"
                    >
                      <button
                        onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                        className="w-full flex items-start justify-between p-4 text-left gap-3"
                      >
                        <div className="flex gap-3">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${hasAnswer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                            {hasAnswer ? '✓' : idx + 1}
                          </span>
                          <div>
                            <span className="text-sm font-medium text-slate-300 leading-relaxed">
                              {questionStr}
                            </span>
                            {hasAnswer && !isExpanded && (
                              <span className="block text-[10px] text-emerald-400 font-medium mt-1">
                                ✓ Answer draft saved
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-500 hover:text-slate-300 mt-0.5 shrink-0">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-800/60 pt-3 bg-slate-900/30">
                          <label className="block text-xs font-semibold text-slate-400 mb-2">
                            Draft Your Answer (STAR method):
                          </label>
                          <textarea
                            value={answers[idx] || ''}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            placeholder="Situation → Task → Action → Result..."
                            rows={5}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition resize-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">

              {/* Research */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-sky-400" />
                  <h3 className="font-bold text-slate-200 text-base">Research These</h3>
                  <span className="text-xs text-slate-500 ml-auto">{researchCount}/{totalResearch} done</span>
                </div>
                <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-4 space-y-3">
                  {prepData.research.map((item, idx) => {
                    const itemStr = toStr(item);
                    const isChecked = !!researchChecked[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleResearchToggle(idx)}
                        className="w-full flex items-start gap-3 text-left group transition py-1"
                      >
                        <span className="mt-0.5 text-slate-500 group-hover:text-slate-300 shrink-0">
                          {isChecked
                            ? <CheckSquare size={18} className="text-sky-400" />
                            : <Square size={18} />}
                        </span>
                        <span className={`text-sm leading-relaxed transition ${isChecked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                          {itemStr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Talking Points */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-emerald-400" />
                  <h3 className="font-bold text-slate-200 text-base">Your Talking Points</h3>
                </div>
                <div className="space-y-3">
                  {prepData.talkingPoints.map((point, idx) => {
                    const pointStr = toStr(point);
                    const isCopied = copiedTalkingPoint === idx;
                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-4 border border-slate-800 rounded-xl bg-slate-950/40 p-4 hover:border-slate-700/60 transition"
                      >
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{pointStr}</p>
                        <button
                          onClick={() => handleCopyText(pointStr, 'talkingPoint', idx)}
                          className={`p-1.5 rounded-lg border border-slate-800 text-slate-400 bg-slate-900/60 hover:text-slate-200 hover:bg-slate-800 transition shrink-0 ${isCopied ? 'text-emerald-400 border-emerald-900' : ''}`}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Smart Question */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle size={20} className="text-amber-400" />
                  <h3 className="font-bold text-slate-200 text-base">Ask Them This</h3>
                </div>
                <div className="border border-violet-500/20 rounded-xl bg-gradient-to-br from-violet-950/30 to-indigo-950/20 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-2xl -mr-6 -mt-6" />
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <p className="text-sm font-semibold text-violet-200 leading-relaxed italic">
                      &ldquo;{smartQuestionStr}&rdquo;
                    </p>
                    <button
                      onClick={() => handleCopyText(smartQuestionStr, 'smartQuestion')}
                      className={`p-1.5 rounded-lg border border-violet-800/40 text-violet-400 bg-violet-950/50 hover:text-violet-200 hover:bg-violet-900/40 transition shrink-0 ${copiedSmartQuestion ? 'text-emerald-400 border-emerald-800/60' : ''}`}
                    >
                      {copiedSmartQuestion ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}