'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Calendar, CheckCircle, ArrowRight, Loader2, Zap, Swords, Plus, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ContestScoreboardSkeleton } from '@/components/ui/Skeletons';
import { CreateRoomModal } from '@/components/contests/CreateRoomModal';
import { JoinRoomModal } from '@/components/contests/JoinRoomModal';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchContests = async () => {
    try {
      const res = await fetch('/api/contests', { credentials: 'include' });
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
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Contest Registered Successfully!', 'success');
        await fetchContests();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to register for contest', 'error');
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
      {/* Modals */}
      <CreateRoomModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <JoinRoomModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-950/40">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              CodeForge Contests & Friend Battles
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compete in live rated contests or create private speed battle rooms with up to 10 friends!
          </p>
        </div>
      </div>

      {/* Friend Battle Arena Card */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              <Swords className="w-3.5 h-3.5" /> Private Room (1v1 to 10 Players)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Challenge Your Friends to a Speed Coding Battle ⚡
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Create a custom room with a unique 6-character code. First coder to submit accepted solutions gets bonus speed points! Maximum limit: <span className="font-bold text-amber-400">10 friends per room</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/20 hover:scale-105 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Private Room
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white hover:bg-slate-800 font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Join via Room Code
            </button>
          </div>
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
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                            Rated
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white">{contest.title}</h3>
                      <p className="text-xs text-slate-400 max-w-2xl">{contest.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          {contest.participantCount} registered
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {contest.problemCount} Problems
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/contests/${contest.id}`}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition flex items-center gap-2"
                      >
                        <span>Enter Contest</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Contests */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Upcoming Weekly Contests
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingContests.map((contest) => (
                <motion.div
                  key={contest.id}
                  whileHover={{ y: -2 }}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4 backdrop-blur-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                        Upcoming
                      </span>
                      {contest.isRated && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase">
                          Rated
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{contest.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{contest.description}</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {new Date(contest.startTime).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        {contest.participantCount} Registered
                      </span>
                    </div>

                    <button
                      onClick={() => handleRegister(contest.id)}
                      disabled={contest.isRegistered || registeringId === contest.id}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                        contest.isRegistered
                          ? 'bg-slate-800 text-emerald-400 border border-slate-700 cursor-default'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md'
                      }`}
                    >
                      {registeringId === contest.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : contest.isRegistered ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" /> Registered
                        </>
                      ) : (
                        'Register Now'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Past Contests */}
          {endedContests.length > 0 && (
            <section className="space-y-4 pt-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Past Contests Archive
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {endedContests.map((contest) => (
                  <div
                    key={contest.id}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white">{contest.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ended on {new Date(contest.endTime).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/contests/${contest.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs border border-slate-700 transition"
                    >
                      View Results
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
}
