"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Trash2,
  Copy, 
  Check, 
  Mic, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  CheckSquare, 
  Square 
} from "lucide-react";
import StatusTimeline, { HistoryItem } from "@/components/StatusTimeline";
import { supabase } from "@/lib/supabase";
import { Job } from "@/lib/types";
import PrepProgressBar from "@/components/PrepProgressBar";
import InterviewPrepButton from "@/components/InterviewPrepButton";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // States for interview preparation
  type PrepData = {
    questions: string[];
    research: string[];
    talkingPoints: string[];
    smartQuestion: string;
    answers?: Record<number, string>;
    researchChecked?: Record<number, boolean>;
    viewedTalkingPoints?: boolean;
  };

  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [researchChecked, setResearchChecked] = useState<Record<number, boolean>>({});
  const [viewedTalkingPoints, setViewedTalkingPoints] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedTalkingPoint, setCopiedTalkingPoint] = useState<number | null>(null);
  const [copiedSmartQuestion, setCopiedSmartQuestion] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Fetch job and timeline history
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get job
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", params.id)
          .single<Job>();
        if (jobError) throw jobError;
        setJob(jobData);

        // 2. Get status history (ordered oldest → newest)
        const { data: histData, error: histError } = await supabase
          .from("status_history")
          .select("id, old_status, new_status, changed_at")
          .eq("job_id", params.id)
          .order("changed_at", { ascending: true });
        if (histError) throw histError;
        setHistory(histData ?? []);
      } catch (e) {
        console.error(e);
        // If we cannot fetch (e.g., unauthenticated) redirect to dashboard
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  // Load localStorage data once job is resolved
  useEffect(() => {
    if (!job) return;
    const saved = localStorage.getItem(`prep_${job.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PrepData;
        setPrepData(parsed);
        setAnswers(parsed.answers || {});
        setResearchChecked(parsed.researchChecked || {});
        setViewedTalkingPoints(parsed.viewedTalkingPoints || false);
      } catch (e) {
        console.error('Failed to parse saved prep data:', e);
      }
    }
  }, [job]);

  // Mark talking points as viewed when seen inline
  useEffect(() => {
    if (prepData && !viewedTalkingPoints) {
      setViewedTalkingPoints(true);
      const updated = {
        ...prepData,
        viewedTalkingPoints: true,
      };
      localStorage.setItem(`prep_${params.id}`, JSON.stringify(updated));
      setPrepData(updated);
    }
  }, [prepData, viewedTalkingPoints, params.id]);

  const handleDelete = async () => {
    if (!confirm("Delete this job permanently?")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", params.id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      router.push("/");
    }
  };

  const handlePrepReady = (data: PrepData) => {
    const initializedData = {
      ...data,
      answers: {},
      researchChecked: {},
      viewedTalkingPoints: true,
    };
    localStorage.setItem(`prep_${params.id}`, JSON.stringify(initializedData));
    setPrepData(initializedData);
    setAnswers({});
    setResearchChecked({});
    setViewedTalkingPoints(true);
  };

  const handleAnswerChange = (idx: number, val: string) => {
    const updatedAnswers = { ...answers, [idx]: val };
    setAnswers(updatedAnswers);
    if (prepData) {
      const updated = {
        ...prepData,
        answers: updatedAnswers,
      };
      localStorage.setItem(`prep_${params.id}`, JSON.stringify(updated));
      setPrepData(updated);
    }
  };

  const handleResearchToggle = (idx: number) => {
    const newVal = !researchChecked[idx];
    const updatedChecked = { ...researchChecked, [idx]: newVal };
    setResearchChecked(updatedChecked);
    if (prepData) {
      const updated = {
        ...prepData,
        researchChecked: updatedChecked,
      };
      localStorage.setItem(`prep_${params.id}`, JSON.stringify(updated));
      setPrepData(updated);
    }
  };

  const handleRegenerate = async () => {
    if (!job) return;
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: job.company,
          role: job.role,
          notes: job.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate prep data');
      }

      const data = await response.json();
      const updated = {
        ...data,
        answers: {},
        researchChecked: {},
        viewedTalkingPoints: true,
      };
      localStorage.setItem(`prep_${job.id}`, JSON.stringify(updated));
      setPrepData(updated);
      setAnswers({});
      setResearchChecked({});
      setViewedTalkingPoints(true);
    } catch (e) {
      console.error(e);
      alert('Error regenerating prep details. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyText = (text: string, type: 'talkingPoint' | 'smartQuestion', idx?: number) => {
    navigator.clipboard.writeText(text);
    if (type === 'talkingPoint' && idx !== undefined) {
      setCopiedTalkingPoint(idx);
      setTimeout(() => setCopiedTalkingPoint(null), 2000);
    } else if (type === 'smartQuestion') {
      setCopiedSmartQuestion(true);
      setTimeout(() => setCopiedSmartQuestion(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400 animate-pulse">
        Loading job details…
      </div>
    );
  }

  if (!job) {
    return null; // Redirect handled earlier
  }

  const savedAnswersCount = Object.values(answers).filter(val => (val || '').trim().length > 0).length;
  const researchDoneCount = Object.values(researchChecked).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="h-5 w-5 text-slate-300" />
        </button>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          {job.company} – {job.role}
        </h1>
        <button
          onClick={handleDelete}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white transition active:scale-95"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </header>

      {/* Job meta */}
      <section className="mb-8 rounded-xl bg-slate-900/30 p-4 border border-slate-800/60 shadow-md">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-400">Company</dt>
            <dd className="font-medium text-slate-200">{job.company}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Role</dt>
            <dd className="font-medium text-slate-200">{job.role}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Applied</dt>
            <dd className="font-medium text-slate-200">
              {new Date(job.applied_date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </dd>
          </div>
          {job.url && (
            <div>
              <dt className="text-slate-400">Job link</dt>
              <dd>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  Open posting
                </a>
              </dd>
            </div>
          )}
          {job.notes && (
            <div className="col-span-2">
              <dt className="text-slate-400">Notes</dt>
              <dd className="text-slate-300 whitespace-pre-line bg-slate-950/20 p-3 rounded-lg border border-slate-900">{job.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Status timeline */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-200">Status History</h2>
        {history.length ? (
          <StatusTimeline history={history} />
        ) : (
          <p className="text-slate-400 text-sm">No status changes recorded yet.</p>
        )}
      </section>

      {/* Interview Prep Section */}
      <section className="border-t border-slate-800 pt-8 mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>🎯</span> AI Interview Prep
            </h2>
            <p className="text-xs text-slate-400">
              Personalized strategy and practice toolkit generated by Claude
            </p>
          </div>
          {prepData && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-850 disabled:text-slate-500 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate Prep'}
            </button>
          )}
        </div>

        {prepData ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <PrepProgressBar
              savedAnswers={savedAnswersCount}
              researchDone={researchDoneCount}
              viewedTalkingPoints={viewedTalkingPoints}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Likely Questions (🎤) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mic size={18} className="text-violet-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Likely Questions</h3>
                </div>

                <div className="space-y-3">
                  {prepData.questions.map((question: string, idx: number) => {
                    const isExpanded = expandedQuestion === idx;
                    const hasAnswer = (answers[idx] || '').trim().length > 0;

                    return (
                      <div
                        key={idx}
                        className="border border-slate-800 rounded-xl bg-slate-900/10 overflow-hidden transition hover:border-slate-700/60"
                      >
                        <button
                          onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                          className="w-full flex items-start justify-between p-4 text-left gap-3"
                        >
                          <div className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-850 text-xs font-bold text-slate-400 shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-sm font-medium text-slate-300 leading-relaxed">
                                {question}
                              </span>
                              {hasAnswer && !isExpanded && (
                                <span className="block text-[10px] text-emerald-400 font-medium mt-1">
                                  ✓ Answer draft saved
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-slate-500 hover:text-slate-300 mt-0.5">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-slate-800 pt-3 bg-slate-950/20">
                            <label className="block text-xs font-semibold text-slate-500 mb-2">
                              Draft Your Answer:
                            </label>
                            <textarea
                              value={answers[idx] || ''}
                              onChange={(e) => handleAnswerChange(idx, e.target.value)}
                              placeholder="Type your speaking points or structured answer (e.g. STAR method) here... Changes are saved automatically."
                              rows={4}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-650 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition resize-none"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Research, Talking Points, Smart Question */}
              <div className="space-y-6">
                {/* Research Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-sky-400" />
                    <h3 className="font-bold text-slate-200 text-sm">Research These</h3>
                  </div>
                  <div className="border border-slate-800/80 rounded-xl bg-slate-900/10 p-4 space-y-3">
                    {prepData.research.map((item: string, idx: number) => {
                      const isChecked = !!researchChecked[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => handleResearchToggle(idx)}
                          className="w-full flex items-start gap-3 text-left group transition py-1"
                        >
                          <span className="mt-0.5 text-slate-500 group-hover:text-slate-300 shrink-0">
                            {isChecked ? (
                              <CheckSquare size={16} className="text-sky-400" />
                            ) : (
                              <Square size={16} />
                            )}
                          </span>
                          <span className={`text-sm leading-relaxed transition ${
                            isChecked ? 'text-slate-500 line-through' : 'text-slate-300'
                          }`}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Talking Points */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-emerald-400" />
                    <h3 className="font-bold text-slate-200 text-sm">Your Talking Points</h3>
                  </div>
                  <div className="space-y-3">
                    {prepData.talkingPoints.map((point: string, idx: number) => {
                      const isCopied = copiedTalkingPoint === idx;
                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-4 border border-slate-800/80 rounded-xl bg-slate-900/10 p-4 hover:border-slate-700/40 transition group"
                        >
                          <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            {point}
                          </p>
                          <button
                            onClick={() => handleCopyText(point, 'talkingPoint', idx)}
                            className={`p-1.5 rounded-lg border border-slate-800 text-slate-400 bg-slate-950 hover:text-slate-200 hover:bg-slate-800 transition shrink-0 ${
                              isCopied ? 'text-emerald-400 border-emerald-900/65' : ''
                            }`}
                            title="Copy to clipboard"
                          >
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Smart Question */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={18} className="text-amber-400" />
                    <h3 className="font-bold text-slate-200 text-sm">Ask Them This</h3>
                  </div>
                  <div className="border border-violet-500/15 rounded-xl bg-gradient-to-br from-violet-950/20 to-indigo-950/15 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/5 rounded-full blur-xl -mr-4 -mt-4"></div>
                    <div className="flex justify-between items-start gap-4 relative z-10">
                      <p className="text-sm font-semibold text-violet-200 leading-relaxed italic">
                        &ldquo;{prepData.smartQuestion}&rdquo;
                      </p>
                      <button
                        onClick={() => handleCopyText(prepData.smartQuestion, 'smartQuestion')}
                        className={`p-1.5 rounded-lg border border-violet-900/40 text-violet-400 bg-violet-950/80 hover:text-violet-200 hover:bg-violet-900/45 transition shrink-0 ${
                          copiedSmartQuestion ? 'text-emerald-400 border-emerald-900/60' : ''
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedSmartQuestion ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center max-w-md mx-auto space-y-4">
            <div className="text-3xl animate-bounce">🎯</div>
            <div>
              <h3 className="font-semibold text-slate-200">No Prep Toolkit Generated</h3>
              <p className="text-xs text-slate-500 mt-1">
                Get custom interview questions, research guidelines, fit highlights, and strategic questions for this role.
              </p>
            </div>
            <InterviewPrepButton
              company={job.company}
              role={job.role}
              notes={job.notes}
              onPrepReady={handlePrepReady}
            />
          </div>
        )}
      </section>
    </div>
  );
}
