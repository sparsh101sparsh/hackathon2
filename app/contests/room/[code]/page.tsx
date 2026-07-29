'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Monaco Editor...</div>,
});
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Users,
  Trophy,
  Copy,
  Check,
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  Flame,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

interface Participant {
  id: string;
  userId: string;
  userName: string;
  score: number;
  solved: number;
}

interface RoomData {
  id: string;
  code: string;
  name: string;
  hostName: string;
  maxPlayers: number;
  difficulty: string;
  problemCount: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  participants: Participant[];
}

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  statement: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  topicTags: string;
  testCases: Array<{ id: string; input: string; expectedOutput: string }>;
  codeTemplates: Array<{ language: string; code: string }>;
}

export default function BattleRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const roomCode = (params.code as string)?.toUpperCase();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your solution here\n');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [solvedProblems, setSolvedProblems] = useState<Record<string, boolean>>({});

  const currentUserId = user?.id || `guest_local`;
  const currentUserName = user?.name || 'Guest Coder';

  const fetchRoomDetails = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}`);
      if (!res.ok) {
        throw new Error('Room not found');
      }
      const data = await res.json();
      setRoom(data.room);
      setProblems(data.problems || []);

      // Automatically set starter code for active problem
      if (data.problems && data.problems.length > 0) {
        const p = data.problems[activeProblemIdx] || data.problems[0];
        const template = p.codeTemplates?.find((t: any) => t.language === language);
        if (template) {
          setCode(template.code);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading battle room', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomCode) {
      fetchRoomDetails();
      const interval = setInterval(fetchRoomDetails, 3000); // Live sync room leaderboard
      return () => clearInterval(interval);
    }
  }, [roomCode, activeProblemIdx]);

  useEffect(() => {
    if (problems.length > 0) {
      const p = problems[activeProblemIdx];
      if (p) {
        const template = p.codeTemplates?.find((t: any) => t.language === language);
        if (template) {
          setCode(template.code);
        }
      }
    }
  }, [language, activeProblemIdx]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    showToast('Room Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartBattle = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START_BATTLE' }),
      });
      if (res.ok) {
        showToast('⚔️ Battle Started! First to submit gets bonus speed points!', 'success');
        await fetchRoomDetails();
      }
    } catch (err) {
      showToast('Failed to start battle', 'error');
    }
  };

  const handleRunCode = async () => {
    const activeProblem = problems[activeProblemIdx];
    if (!activeProblem) return;

    setExecuting(true);
    setExecutionResult(null);

    try {
      const sampleTc = activeProblem.testCases?.[0];
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          input: sampleTc?.input || '',
        }),
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      showToast('Code execution error', 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    const activeProblem = problems[activeProblemIdx];
    if (!activeProblem) return;

    setExecuting(true);
    setExecutionResult(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: activeProblem.id,
          language,
          code,
        }),
      });

      const data = await res.json();
      setExecutionResult(data);

      if (data.verdict === 'Accepted') {
        showToast('🎉 Accepted! Solution passed all test cases!', 'success');
        setSolvedProblems((prev) => ({ ...prev, [activeProblem.id]: true }));

        // Award points in battle room
        await fetch(`/api/rooms/${roomCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SCORE_POINTS',
            userId: currentUserId,
            userName: currentUserName,
            pointsToAdd: 150, // 100 pts base + 50 speed bonus
          }),
        });

        await fetchRoomDetails();
      } else {
        showToast(`Verdict: ${data.verdict || 'Wrong Answer'}`, 'error');
      }
    } catch (err: any) {
      showToast('Submission error', 'error');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Connecting to Battle Room...</span>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <h2 className="text-xl font-bold text-white">Battle Room Not Found</h2>
        <Link href="/contests" className="px-4 py-2 bg-slate-800 text-cyan-400 text-xs rounded-xl font-bold">
          Back to Contests
        </Link>
      </div>
    );
  }

  const activeProblem = problems[activeProblemIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Arena Navigation Bar */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/contests" className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <Swords className="w-3 h-3 inline mr-1" /> Speed Battle
              </span>
              <h1 className="text-base font-black text-white">{room.name}</h1>
            </div>
            <p className="text-[11px] text-slate-400">Host: {room.hostName}</p>
          </div>
        </div>

        {/* Room Code Badge & Copy */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400">CODE:</span>
            <span className="font-mono font-extrabold text-amber-400 text-xs tracking-wider">{roomCode}</span>
            <button onClick={handleCopyCode} className="ml-1 text-slate-400 hover:text-white transition">
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{room.participants.length} / {room.maxPlayers} Friends</span>
          </div>

          {room.status === 'WAITING' && (
            <button
              onClick={handleStartBattle}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4" /> Start Battle
            </button>
          )}
        </div>
      </header>

      {/* Main Grid: Left Problem & Editor, Right Live Leaderboard */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Workspace: 3 Columns on Large Screens */}
        <div className="lg:col-span-3 flex flex-col border-r border-slate-800/80">
          {/* Problem Selector Tabs */}
          <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
            {problems.map((p, idx) => {
              const isSolved = solvedProblems[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProblemIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeProblemIdx === idx
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>Q{idx + 1}. {p.title}</span>
                  {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Problem Statement & Monaco Editor */}
          {activeProblem ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
              {/* Problem Description */}
              <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white">{activeProblem.title}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    activeProblem.difficulty === 'EASY'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : activeProblem.difficulty === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {activeProblem.difficulty}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {activeProblem.statement}
                </div>

                {/* Sample Test Case */}
                {activeProblem.testCases?.[0] && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="text-xs font-bold text-cyan-400">Sample Test Case</div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Input: </span>
                        <span className="text-slate-200">{activeProblem.testCases[0].input}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Expected Output: </span>
                        <span className="text-emerald-400">{activeProblem.testCases[0].expectedOutput}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor Panel */}
              <div className="flex flex-col border-l border-slate-800/80 bg-slate-900/40">
                {/* Language Selector & Controls */}
                <div className="p-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="python">Python 3</option>
                    <option value="cpp">C++</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={executing}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Run Code
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={executing}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      {executing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Submit</span>
                    </button>
                  </div>
                </div>

                {/* Monaco Editor Component */}
                <div className="flex-1 relative min-h-[300px]">
                  <CodeEditor
                    language={language}
                    value={code}
                    onChange={(val) => setCode(val || '')}
                  />
                </div>

                {/* Execution Result Box */}
                {executionResult && (
                  <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs font-mono space-y-2 max-h-40 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400">Execution Output:</span>
                      <span className={`font-bold ${executionResult.verdict === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {executionResult.verdict || 'Completed'}
                      </span>
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap font-mono text-[11px]">
                      {executionResult.stdout || executionResult.stderr || JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">No active problem selected</div>
          )}
        </div>

        {/* Live Leaderboard Sidebar (Max 10 Players) */}
        <div className="p-4 bg-slate-950 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Battle Rankings</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold font-mono">
              Max 10
            </span>
          </div>

          <div className="space-y-2">
            {room.participants.map((p, rankIdx) => {
              const isFirst = rankIdx === 0;
              const isSecond = rankIdx === 1;
              const isThird = rankIdx === 2;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/40'
                      : isSecond
                      ? 'bg-slate-900 border-slate-400/40'
                      : isThird
                      ? 'bg-slate-900 border-amber-700/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-black font-mono">
                      {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${rankIdx + 1}`}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{p.userName}</span>
                        {p.userName === room.hostName && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{p.solved} Solved</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-amber-400 font-mono">{p.score} pts</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Room Share Footer */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <p className="text-[11px] text-slate-400">Invite up to 10 friends with code:</p>
            <button
              onClick={handleCopyCode}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono font-bold text-cyan-400 flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Invite Code ({roomCode})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
