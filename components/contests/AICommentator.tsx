'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, RefreshCw, Radio, Flame, ShieldAlert } from 'lucide-react';

interface AICommentatorProps {
  roomName?: string;
  mode?: string;
  status?: string;
  participants?: any[];
  activeProblemTitle?: string;
  lastEvent?: string;
}

export const AICommentator: React.FC<AICommentatorProps> = ({
  roomName = 'Battle Arena',
  mode = 'DUEL',
  status = 'IN_PROGRESS',
  participants = [],
  activeProblemTitle = 'DSA Problem',
  lastEvent = 'GENERAL',
}) => {
  const [commentary, setCommentary] = useState<string>('🎙️ AI Commentator is standing by for live battle updates...');
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const fetchCommentary = async (evt: string = lastEvent) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/commentator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomName,
          mode,
          status,
          participants,
          activeProblemTitle,
          event: evt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.commentary?.text) {
          const text = data.commentary.text;
          setCommentary(text);
          setHistory((prev) => [text, ...prev.slice(0, 4)]);

          // Speech synthesis if unmuted
          if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.05;
            utterance.pitch = 1.0;
            window.speechSynthesis.cancel(); // cancel previous speech
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    } catch (err) {
      console.error('Commentary error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch commentary on initial load and periodic interval
  useEffect(() => {
    fetchCommentary(lastEvent);
    const interval = setInterval(() => {
      fetchCommentary('PERIODIC_UPDATE');
    }, 20000); // update every 20s

    return () => clearInterval(interval);
  }, [lastEvent, activeProblemTitle, participants.length]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background glow accent */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>AI Live Commentator</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Radio className="w-2.5 h-2.5 animate-ping" /> LIVE BROADCAST
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* TTS Mute / Unmute Button */}
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            title={isMuted ? 'Enable Voice Commentary (TTS)' : 'Mute Voice Commentary'}
            className={`p-1.5 rounded-lg text-xs transition border ${
              !isMuted
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Refresh Commentary Button */}
          <button
            onClick={() => fetchCommentary('MANUAL_REFRESH')}
            disabled={loading}
            title="Refresh Commentary"
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Commentary Live Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={commentary}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-xs font-semibold text-slate-200 leading-relaxed bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 shadow-inner flex items-start gap-2.5"
        >
          <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="flex-1 font-sans tracking-wide text-amber-100/90">{commentary}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
