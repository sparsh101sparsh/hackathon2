'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  BookOpen,
  ArrowRight,
  Loader2,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';

interface ProblemData {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  topicTags: string;
  statement: string;
  editorial: string;
}

interface RevisionCardItem {
  id: string;
  problemId: string;
  pattern: string;
  keyTakeaway: string;
  timeComplexity: string;
  spaceComplexity: string;
  interval: number;
  repetitions: number;
  dueDate: string;
  failureCount: number;
  lastFailureType?: string | null;
  lastError?: string | null;
  lastFailedInput?: string | null;
  lastExpectedOutput?: string | null;
  lastActualOutput?: string | null;
  problem: ProblemData;
}

export default function RevisionPage() {
  const [cards, setCards] = useState<RevisionCardItem[]>([]);
  const [dueCards, setDueCards] = useState<RevisionCardItem[]>([]);
  const [stats, setStats] = useState({ totalCards: 0, dueTodayCount: 0, masteredCount: 0, learnedMistakeCount: 0 });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchRevisionData = async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/revision', { signal });
      if (!res.ok) throw new Error('Failed to fetch revision deck');
      const data = await res.json();
      setCards(data.cards || []);
      setDueCards(data.dueCards || []);
      setStats(data.stats || { totalCards: 0, dueTodayCount: 0, masteredCount: 0, learnedMistakeCount: 0 });
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Error fetching revision data:', err);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchRevisionData(controller.signal);

    return () => controller.abort();
  }, []);

  const handleRateCard = async (quality: 'HARD' | 'GOOD' | 'EASY') => {
    const card = dueCards[currentIdx];
    if (!card) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          quality,
        }),
      });

      if (res.ok) {
        showToast(`Card rated ${quality}! Next review scheduled.`, 'success');
        setIsFlipped(false);
        if (currentIdx < dueCards.length - 1) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          await fetchRevisionData();
          setCurrentIdx(0);
        }
      } else {
        const data = await res.json().catch(() => null);
        showToast(data?.error || 'Failed to record rating', 'error');
      }
    } catch (err) {
      showToast('Failed to record rating', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Loading Spaced Repetition Deck...</span>
      </div>
    );
  }

  const currentCard = dueCards[currentIdx];

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-lg shadow-amber-950/20">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Spaced Repetition & DSA Revision Deck
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Never forget solved problem patterns! Re-visit solved problems at optimal memory retention intervals.
          </p>
        </div>

        {/* Stats Pill Strip */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#111115] border border-white/10 rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Due Today</div>
              <div className="text-sm font-black text-amber-400 font-mono">{stats.dueTodayCount}</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-[#111115] border border-white/10 rounded-lg flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Learned Mistakes</div>
              <div className="text-sm font-black text-amber-400 font-mono">{stats.learnedMistakeCount}</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-[#111115] border border-white/10 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Mastered</div>
              <div className="text-sm font-black text-amber-300 font-mono">{stats.masteredCount}</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-[#111115] border border-white/10 rounded-lg flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Deck</div>
              <div className="text-sm font-black text-slate-200 font-mono">{stats.totalCards}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Interactive Arena */}
      {dueCards.length > 0 && currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Card {currentIdx + 1} of {dueCards.length}</span>
            <span className="font-mono text-amber-400 font-bold">{Math.round(((currentIdx + 1) / dueCards.length) * 100)}% Completed Today</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / dueCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Flashcard */}
          <motion.div
            onClick={() => setIsFlipped(!isFlipped)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsFlipped((previous) => !previous);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Show revision question' : 'Reveal revision answer'}
            className="cursor-pointer min-h-[380px] bg-[#0f0f12] border border-white/10 hover:border-amber-400/50 rounded-xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between transition-all group overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-amber-400/70" />

            {/* Front of Card */}
            {!isFlipped ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                      Pattern: {currentCard.pattern}
                    </span>
                    <DifficultyBadge difficulty={currentCard.problem?.difficulty || 'EASY'} />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition">
                    {currentCard.problem?.title}
                  </h2>
                  {currentCard.failureCount > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-400/10 border border-amber-400/25">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                        Learned from {currentCard.failureCount} failed {currentCard.failureCount === 1 ? 'attempt' : 'attempts'}
                        {currentCard.lastFailureType ? ` · ${currentCard.lastFailureType}` : ''}
                      </div>
                      <p className="text-xs text-amber-100/80 mt-1">This card was brought forward because the platform found a weak spot in your latest submission.</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-4 leading-relaxed">
                    {currentCard.problem?.statement}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#08080a] border border-white/10 text-center space-y-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                    <RotateCw className="w-4 h-4 animate-spin-slow" /> Click or Tap to Flip & Reveal Answer Logic
                  </span>
                </div>
              </div>
            ) : (
              /* Back of Card */
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Solution Key & Takeaway
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Interval: {currentCard.interval} days
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-400/5 border border-amber-400/20 space-y-2">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Socratic Key Logic
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {currentCard.keyTakeaway}
                    </p>
                  </div>

                  {currentCard.failureCount > 0 && (
                    <div className="p-4 rounded-lg bg-amber-400/5 border border-amber-400/20 space-y-3">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" /> What tripped you up
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Latest {currentCard.lastFailureType || 'failed'} submission
                      </div>
                      {currentCard.lastError && (
                        <pre className="text-[11px] text-amber-100/90 bg-[#08080a] border border-amber-400/20 rounded-lg p-2 whitespace-pre-wrap break-words max-h-24 overflow-auto">{currentCard.lastError}</pre>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-[#08080a] rounded-lg p-2 border border-white/5"><span className="block text-slate-500 uppercase text-[9px]">Input</span><span className="text-slate-200 break-words">{currentCard.lastFailedInput || 'Unavailable'}</span></div>
                        <div className="bg-[#08080a] rounded-lg p-2 border border-white/5"><span className="block text-slate-500 uppercase text-[9px]">Expected</span><span className="text-amber-300 break-words">{currentCard.lastExpectedOutput || 'Unavailable'}</span></div>
                        <div className="bg-[#08080a] rounded-lg p-2 border border-white/5"><span className="block text-slate-500 uppercase text-[9px]">Your output</span><span className="text-rose-300 break-words">{currentCard.lastActualOutput || 'No output'}</span></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Time Complexity</span>
                      <span className="text-amber-300 font-bold">{currentCard.timeComplexity || 'O(N)'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Space Complexity</span>
                      <span className="text-slate-200 font-bold">{currentCard.spaceComplexity || 'O(1)'}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/problems/${currentCard.problemId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-2 bg-[#08080a] hover:bg-[#18181d] border border-white/10 text-amber-400 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5 transition"
                >
                  <span>Re-Solve Problem Code Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Self Rating Buttons (SM-2 Spaced Repetition) */}
          <div className="space-y-2">
            <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rate Your Recall Performance
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleRateCard('HARD')}
                disabled={submitting}
                className="py-3 px-4 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition flex flex-col items-center gap-0.5"
              >
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" aria-hidden="true" /> Hard</span>
                <span className="text-[10px] text-rose-500 font-normal">Review in 1 Day</span>
              </button>
              <button
                onClick={() => handleRateCard('GOOD')}
                disabled={submitting}
                className="py-3 px-4 rounded-lg bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 text-amber-300 font-bold text-xs transition flex flex-col items-center gap-0.5"
              >
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" /> Good</span>
                <span className="text-[10px] text-amber-500 font-normal">Review in 3 Days</span>
              </button>
              <button
                onClick={() => handleRateCard('EASY')}
                disabled={submitting}
                className="py-3 px-4 rounded-lg bg-[#111115] border border-white/10 hover:border-amber-400/40 text-slate-200 font-bold text-xs transition flex flex-col items-center gap-0.5"
              >
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" aria-hidden="true" /> Easy</span>
                <span className="text-[10px] text-slate-400 font-normal">Review in 7 Days</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Deck Completed View */
        <div className="bg-[#0f0f12] border border-white/10 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-2xl">
          <div className="inline-flex items-center justify-center p-4 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">All Revisions Completed Today</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Great job! You have revised all due DSA flashcards for today. Spaced repetition ensures long-term memory retention for FAANG interviews.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/problems"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#08080a] font-bold text-xs rounded-lg shadow-lg transition"
            >
              Solve More Problems
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
