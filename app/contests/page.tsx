'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Calendar, CheckCircle, ArrowRight, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ContestScoreboardSkeleton } from '@/components/ui/Skeletons';

interface ContestItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isRated: boolean;
  status: 'ACTIVE' | 'UPCOMING' | 'ENDED';
  problemCount: number;
  participantCount: number;
  isRegistered: boolean;
}

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchContests = async () => {
    try {
      const res = await fetch('/api/contests');
      if (!res.ok) throw new Error('Failed to fetch contests');
      const data = await res.json();
      setContests(data.contests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleRegister = async (contestId: string) => {
    setRegisteringId(contestId);
    try {
      const res = await fetch(`/api/contests/${contestId}/register`, {
        method: 'POST',
      });
      if (res.ok) {
        showToast('Contest Registered Successfully!', 'success');
        await fetchContests();
      } else {
        showToast('Failed to register for contest', 'error');
      }
    } catch (err) {
      console.error('Failed to register', err);
      showToast('Error connecting to registration service', 'error');
    } finally {
      setRegisteringId(null);
    }
  };

  const activeContests = contests.filter((c) => c.status === 'ACTIVE');
  const upcomingContests = contests.filter((c) => c.status === 'UPCOMING');
  const endedContests = contests.filter((c) => c.status === 'ENDED');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-950/40">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              CodeForge Rated Contests
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test your algorithmic skills in live timed competitions & gain rating badges
          </p>
        </div>
      </div>

      {loading ? (
        <ContestScoreboardSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Active Live Contests */}
          {activeContests.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Contests In Progress
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activeContests.map((contest) => (
                  <motion.div
                    key={contest.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                          Live Now
                        </span>
                        {contest.isRated && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Rated
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{contest.title}</h3>
                      <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{contest.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          {contest.participantCount} Participants
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {contest.problemCount} Problems
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/contests/${contest.id}`}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 shrink-0 hover:scale-105"
                    >
                      <span>Enter Arena</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Contests */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Upcoming Rated Rounds
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingContests.map((contest) => (
                <motion.div
                  key={contest.id}
                  whileHover={{ y: -3 }}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 backdrop-blur-xl hover:border-cyan-500/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                        Upcoming
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {new Date(contest.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">{contest.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{contest.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {contest.participantCount} Registered
                    </span>

                    {contest.isRegistered ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(contest.id)}
                        disabled={registeringId === contest.id}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-transform flex items-center gap-1.5 disabled:opacity-50 hover:scale-105 shadow-md shadow-cyan-950/50"
                      >
                        {registeringId === contest.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
                        <span>Register Now</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Past Contests */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Past Contests & Scoreboards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endedContests.map((contest) => (
                <motion.div
                  key={contest.id}
                  whileHover={{ y: -2 }}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between gap-4 backdrop-blur-xl"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{contest.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ended on {new Date(contest.endTime).toLocaleDateString('en-US')} • {contest.participantCount} participants
                    </p>
                  </div>

                  <Link
                    href={`/contests/${contest.id}`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-700 shrink-0 hover:border-slate-600"
                  >
                    View Scoreboard
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}
    </motion.div>
  );
}
