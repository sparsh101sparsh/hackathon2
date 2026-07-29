'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Sparkles, Loader2, Trophy, Swords } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [hostName, setHostName] = useState('');
  const [difficulty, setDifficulty] = useState<'MIXED' | 'EASY' | 'MEDIUM' | 'HARD'>('MIXED');
  const [problemCount, setProblemCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          hostName: hostName || undefined,
          difficulty,
          problemCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      onClose();
      router.push(`/contests/room/${data.roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Error creating room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create Battle Room</h3>
                <p className="text-xs text-slate-400">Compete with friends (Max 10 players)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">Room Name</label>
              <input
                type="text"
                placeholder="Speed Demons Arena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">Your Display Name</label>
              <input
                type="text"
                placeholder="SpeedCoder"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Difficulty Pool</label>
              <div className="grid grid-cols-4 gap-2">
                {(['MIXED', 'EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                      difficulty === d
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Count */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Number of Problems: <span className="text-amber-400 font-mono">{problemCount}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setProblemCount(cnt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      problemCount === cnt
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Player Limit Note */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-cyan-400" /> Max Players Limit
              </span>
              <span className="font-bold text-amber-400 font-mono">10 Friends</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Battle Arena...
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4" /> Create Battle Room
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
