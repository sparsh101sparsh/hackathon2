'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, RefreshCw, Radio, Flame, Zap, ShieldAlert, History, UserCheck } from 'lucide-react';

export interface ParticipantInfo {
  id?: string;
  userId?: string;
  name?: string;
  userName?: string;
  score?: number;
  scores?: number;
  solved?: number;
  timeSpent?: number;
  progress?: string;
}

export interface ExecutionResultInfo {
  verdict?: string;
  stdout?: string;
  stderr?: string;
  time?: number;
  memory?: number;
  [key: string]: unknown;
}

export interface AICommentatorProps {
  roomCode?: string;
  roomName?: string;
  eventType?: 'JOIN' | 'SUBMIT' | 'LEAD_SWAP' | 'FAST_SUBMISSION' | 'HIGH_SCORE' | 'TICK' | string;
  lastEvent?: string;
  mode?: string;
  status?: string;
  participants?: ParticipantInfo[];
  problemTitle?: string;
  activeProblemTitle?: string;
  language?: string;
  codeSnippet?: string;
  linesOfCode?: number;
  executionResult?: ExecutionResultInfo;
  userName?: string;
  className?: string;
}

export interface CommentaryMessage {
  id: string;
  text: string;
  timestamp: number;
  hypeLevel: 'high' | 'medium' | 'low';
  speaker: 'Shoutcaster';
}

/**
 * Strip unicode emojis and special symbol glyphs before sending text to speech synthesis.
 */
function stripEmojis(text: string): string {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu,
      ''
    )
    .replace(/🎙️|🔥|⚡|👀|🎯|⚔️|🧠|👑|🏎️|🏆|🥇|🥈|🥉|💥|🚀|💎|📢/g, '')
    .replace(/\uFE0F/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const AICommentator: React.FC<AICommentatorProps> = ({
  roomCode,
  roomName = 'Battle Arena',
  eventType,
  lastEvent = 'GENERAL',
  mode = 'DUEL',
  status = 'IN_PROGRESS',
  participants = [],
  problemTitle,
  activeProblemTitle,
  language = 'cpp',
  codeSnippet = '',
  linesOfCode = 0,
  executionResult,
  userName,
  className = '',
}) => {
  const [currentMessage, setCurrentMessage] = useState<CommentaryMessage>({
    id: 'initial',
    text: '🎙️ AI Shoutcaster is locked in and ready for battle updates!',
    timestamp: Date.now(),
    hypeLevel: 'medium',
    speaker: 'Shoutcaster',
  });
  const [history, setHistory] = useState<CommentaryMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const codeSnippetRef = useRef(codeSnippet);
  useEffect(() => {
    codeSnippetRef.current = codeSnippet;
  }, [codeSnippet]);

  const effectiveProblemTitle = problemTitle || activeProblemTitle || 'DSA Challenge';
  const effectiveEvent = eventType || lastEvent || 'TICK';
  const effectiveRoomCode = roomCode || roomName || 'ARENA-1';

  // Voice Selection setup
  const loadBestVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer English Shoutcaster style voices
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Alex') ||
            v.name.includes('Daniel'))
      ) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    setSelectedVoice(preferredVoice || null);
  }, []);

  useEffect(() => {
    loadBestVoice();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadBestVoice;
    }
  }, [loadBestVoice]);

  // Speech Cancellation on unmount & mute state change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  // TTS Execution helper
  const speakCommentary = useCallback(
    (rawText: string, overrideMuted: boolean = isMuted) => {
      const effectiveMuted = overrideMuted;
      if (effectiveMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const cleanText = stripEmojis(rawText);
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = 1.1; // Dynamic, fast esports pace
        utterance.pitch = 1.05; // Slightly elevated pitch for hype feel
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[AICommentator TTS Warning]:', err);
      }
    },
    [isMuted, selectedVoice]
  );

  // Fetch commentary from API route
  const fetchCommentary = useCallback(
    async (evtOverride?: string) => {
      setLoading(true);
      const targetEvent = evtOverride || effectiveEvent;

      try {
        const res = await fetch('/api/ai/commentator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            roomCode: effectiveRoomCode,
            roomName,
            eventType: targetEvent,
            event: targetEvent,
            participants,
            problemTitle: effectiveProblemTitle,
            activeProblemTitle: effectiveProblemTitle,
            language,
            codeSnippet: codeSnippetRef.current,
            linesOfCode,
            executionResult,
            userName,
            mode,
            status,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let text = '🎙️ Battle action intensifying in the arena!';
          let hype: 'high' | 'medium' | 'low' = 'medium';
          let ts = Date.now();
          let spk: 'Shoutcaster' = 'Shoutcaster';

          if (data.commentary) {
            if (typeof data.commentary === 'string') {
              text = data.commentary;
            } else if (typeof data.commentary === 'object') {
              text = data.commentary.text || data.commentary.commentary || text;
            }
          }
          if (data.hypeLevel) hype = data.hypeLevel;
          if (data.timestamp) ts = data.timestamp;
          if (data.speaker) spk = data.speaker;

          const msgObj: CommentaryMessage = {
            id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            text,
            timestamp: ts,
            hypeLevel: hype,
            speaker: spk,
          };

          setCurrentMessage(msgObj);
          setHistory((prev) => [msgObj, ...prev.slice(0, 7)]);
          speakCommentary(text);
        }
      } catch (err) {
        console.error('[AICommentator Error]:', err);
      } finally {
        setLoading(false);
      }
    },
    [
      effectiveRoomCode,
      roomName,
      effectiveEvent,
      participants,
      effectiveProblemTitle,
      language,
      mode,
      status,
      speakCommentary,
    ]
  );

  // Trigger fetch on event or prop changes
  useEffect(() => {
    fetchCommentary(effectiveEvent);
  }, [effectiveEvent, effectiveProblemTitle, participants.length]);

  // Periodic interval tick
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCommentary('TICK');
    }, 20000); // 20-second shoutcaster ticker

    return () => clearInterval(interval);
  }, [fetchCommentary]);

  const toggleTTS = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (!nextMute && currentMessage.text) {
      speakCommentary(currentMessage.text, false);
    }
  };

  // Dynamic styling based on hype level
  const getHypeBadgeProps = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return {
          label: 'HIGH HYPE 🔥',
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          icon: <Flame className="w-3.5 h-3.5 animate-bounce text-rose-400" />,
          glow: 'from-rose-500/20 via-orange-500/10 to-transparent',
        };
      case 'medium':
        return {
          label: 'MEDIUM HYPE ⚡',
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: <Zap className="w-3.5 h-3.5 animate-pulse text-amber-400" />,
          glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
        };
      default:
        return {
          label: 'STEADY HYPE 🎙️',
          bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
          glow: 'from-cyan-500/20 via-slate-900/10 to-transparent',
        };
    }
  };

  const hypeProps = getHypeBadgeProps(currentMessage.hypeLevel);

  return (
    <div
      className={`bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden backdrop-blur-md transition-all ${className}`}
    >
      {/* Dynamic Background Glow */}
      <div
        className={`absolute -right-12 -bottom-12 w-40 h-40 bg-gradient-to-br ${hypeProps.glow} rounded-full blur-3xl pointer-events-none`}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>AI Shoutcaster</span>
          </div>

          {/* Hype Level Badge */}
          <span
            className={`flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${hypeProps.bg}`}
          >
            {hypeProps.icon}
            <span>{hypeProps.label}</span>
          </span>
        </div>

        {/* Action Button Controls */}
        <div className="flex items-center gap-1.5">
          {/* Recent History Toggle */}
          <button
            onClick={() => setShowHistory((prev) => !prev)}
            title="View Commentary History"
            className={`p-1.5 rounded-xl text-xs font-bold transition border ${
              showHistory
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {/* TTS Audio Toggle Button */}
          <button
            onClick={toggleTTS}
            title={isMuted ? '🔊 Unmute Voice Commentary' : '🔇 Mute Voice Commentary'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              !isMuted
                ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Mute TTS</span>
              </>
            )}
          </button>

          {/* Refresh Commentary Button */}
          <button
            onClick={() => fetchCommentary('MANUAL_REFRESH')}
            disabled={loading}
            title="Trigger Fresh Callout"
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Animated Ticker Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 shadow-inner flex items-start gap-3 relative"
        >
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="font-bold text-amber-400/90">SPEAKER: {currentMessage.speaker}</span>
              <span>{new Date(currentMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <p className="font-sans tracking-wide text-amber-50/90 font-medium">{currentMessage.text}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Optional History Log Panel */}
      {showHistory && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-slate-800 space-y-2 max-h-36 overflow-y-auto pr-1"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Commentary Log</p>
          {history.map((item) => (
            <div key={item.id} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-2">
              <span className="text-amber-400 font-mono text-[10px] shrink-0">{new Date(item.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</span>
              <span className="flex-1 text-slate-300 font-sans">{item.text}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
