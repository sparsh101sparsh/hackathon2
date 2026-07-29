'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Zap,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface ProblemVisualizerProps {
  problemId: string;
  problemTitle: string;
  topicTags?: string | string[];
}

interface FrameStep {
  step: number;
  array: number[];
  pointers: { [key: string]: number };
  activeIndices?: number[];
  commentary: string;
  complexityTime: string;
  complexitySpace: string;
}

export const ProblemVisualizer: React.FC<ProblemVisualizerProps> = ({
  problemId,
  problemTitle,
  topicTags = '[]',
}) => {
  const [visualizerConfig, setVisualizerConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approach, setApproach] = useState<'brute' | 'optimized'>('optimized');

  // Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [speed, setSpeed] = useState(1200); // ms per step

  // Generate Sample Dynamic Frames based on algorithm pattern
  const generateFrames = (): FrameStep[] => {
    let parsedTopics: string[] = [];
    if (Array.isArray(topicTags)) {
      parsedTopics = topicTags;
    } else if (typeof topicTags === 'string') {
      try {
        parsedTopics = JSON.parse(topicTags);
      } catch {
        parsedTopics = [topicTags];
      }
    }

    const pattern = parsedTopics[0] || 'General DSA';

    if (pattern.includes('Two Pointers') || problemTitle.toLowerCase().includes('two sum')) {
      return [
        {
          step: 1,
          array: [1, 4, 6, 8, 11, 15],
          pointers: { L: 0, R: 5 },
          activeIndices: [0, 5],
          commentary: 'Step 1: Check L=0 (val 1) & R=5 (val 15). Sum = 16 > Target 14. Decrement R pointer.',
          complexityTime: approach === 'brute' ? 'O(N²)' : 'O(N)',
          complexitySpace: 'O(1)',
        },
        {
          step: 2,
          array: [1, 4, 6, 8, 11, 15],
          pointers: { L: 0, R: 4 },
          activeIndices: [0, 4],
          commentary: 'Step 2: Check L=0 (val 1) & R=4 (val 11). Sum = 12 < Target 14. Increment L pointer.',
          complexityTime: approach === 'brute' ? 'O(N²)' : 'O(N)',
          complexitySpace: 'O(1)',
        },
        {
          step: 3,
          array: [1, 4, 6, 8, 11, 15],
          pointers: { L: 1, R: 4 },
          activeIndices: [1, 4],
          commentary: 'Step 3: Check L=1 (val 4) & R=4 (val 11). Sum = 15 > Target 14. Decrement R pointer.',
          complexityTime: approach === 'brute' ? 'O(N²)' : 'O(N)',
          complexitySpace: 'O(1)',
        },
        {
          step: 4,
          array: [1, 4, 6, 8, 11, 15],
          pointers: { L: 1, R: 3 },
          activeIndices: [1, 3],
          commentary: 'Step 4: Check L=1 (val 4) & R=3 (val 8). Sum = 12 < Target 14. Increment L pointer.',
          complexityTime: approach === 'brute' ? 'O(N²)' : 'O(N)',
          complexitySpace: 'O(1)',
        },
        {
          step: 5,
          array: [1, 4, 6, 8, 11, 15],
          pointers: { L: 2, R: 3 },
          activeIndices: [2, 3],
          commentary: '🎉 Step 5: Check L=2 (val 6) & R=3 (val 8). Sum = 14 == Target 14! Match found at indices [2, 3].',
          complexityTime: approach === 'brute' ? 'O(N²)' : 'O(N)',
          complexitySpace: 'O(1)',
        },
      ];
    }

    // Default Array/Window pattern frames
    return [
      {
        step: 1,
        array: [2, 7, 11, 15],
        pointers: { i: 0, j: 1 },
        activeIndices: [0, 1],
        commentary: 'Step 1: Inspect element at index 0 (val 2) and index 1 (val 7).',
        complexityTime: 'O(N)',
        complexitySpace: 'O(N)',
      },
      {
        step: 2,
        array: [2, 7, 11, 15],
        pointers: { i: 1, j: 2 },
        activeIndices: [1, 2],
        commentary: 'Step 2: Advance window to index 1 (val 7) and index 2 (val 11).',
        complexityTime: 'O(N)',
        complexitySpace: 'O(N)',
      },
      {
        step: 3,
        array: [2, 7, 11, 15],
        pointers: { i: 2, j: 3 },
        activeIndices: [2, 3],
        commentary: '🎉 Step 3: Optimal pattern match satisfied! Execution completed.',
        complexityTime: 'O(N)',
        complexitySpace: 'O(N)',
      },
    ];
  };

  const frames = generateFrames();
  const currentFrame = frames[currentStepIdx] || frames[0];

  // Fetch matched visualizer config
  useEffect(() => {
    fetch('/data/visualizers.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data[problemId]) {
          setVisualizerConfig(data[problemId]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [problemId]);

  // Auto-play timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, frames.length]);

  const pointerColors: { [key: string]: string } = {
    L: 'text-amber-400 border-amber-400 bg-amber-500/10',
    R: 'text-cyan-400 border-cyan-400 bg-cyan-500/10',
    i: 'text-purple-400 border-purple-400 bg-purple-500/10',
    j: 'text-emerald-400 border-emerald-400 bg-emerald-500/10',
    slow: 'text-rose-400 border-rose-400 bg-rose-500/10',
    fast: 'text-cyan-400 border-cyan-400 bg-cyan-500/10',
  };

  return (
    <div className="min-h-[520px] bg-slate-950 text-slate-100 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
      {/* Top Header & Approach Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Interactive Algorithm Step Visualizer
            </h2>
            {visualizerConfig?.hasVisualizer && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ChaiCode Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Watch pointers glide, array cells swap, and complexity drop step-by-step.
          </p>
        </div>

        {/* Approach Leap Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => {
              setApproach('brute');
              setCurrentStepIdx(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              approach === 'brute'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Brute Force O(N²)
          </button>
          <button
            onClick={() => {
              setApproach('optimized');
              setCurrentStepIdx(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              approach === 'optimized'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Optimized O(N)
          </button>
        </div>
      </div>

      {/* Main Canvas & Array Box Display */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden space-y-6 shadow-inner">
        <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" /> Frame State {currentStepIdx + 1} / {frames.length}
        </div>

        {/* Array Cells Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-4">
          {currentFrame.array.map((val, idx) => {
            const isActive = currentFrame.activeIndices?.includes(idx);
            const activePointers = Object.entries(currentFrame.pointers).filter(([_, pIdx]) => pIdx === idx);

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                {/* Pointer Badge above Cell */}
                <div className="h-6 flex items-center justify-center gap-1">
                  {activePointers.map(([pName]) => (
                    <span
                      key={pName}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border shadow-lg ${
                        pointerColors[pName] || 'text-cyan-400 border-cyan-400 bg-cyan-500/10'
                      }`}
                    >
                      ▲ {pName}
                    </span>
                  ))}
                </div>

                {/* Array Box Cell */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : 1,
                    borderColor: isActive ? '#a855f7' : '#334155',
                  }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center text-lg sm:text-xl font-bold font-mono shadow-xl ${
                    isActive
                      ? 'bg-purple-950/60 text-purple-200 border-purple-500 shadow-purple-950/50'
                      : 'bg-slate-950 text-slate-200 border-slate-800'
                  }`}
                >
                  {val}
                </motion.div>

                {/* Index Label */}
                <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Live Commentary Step Action */}
        <div className="w-full max-w-xl p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
          <p className="text-xs font-mono text-cyan-300 leading-relaxed font-semibold">
            {currentFrame.commentary}
          </p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIdx(0);
            }}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 transition"
            title="Reset Visualizer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIdx((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentStepIdx === 0}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition"
            title="Step Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/40 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Play Step-by-Step'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIdx((prev) => Math.min(frames.length - 1, prev + 1));
            }}
            disabled={currentStepIdx === frames.length - 1}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition"
            title="Step Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & External Visualizer Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono"
            >
              <option value={2000}>0.5x Slow</option>
              <option value={1200}>1.0x Normal</option>
              <option value={600}>2.0x Fast</option>
            </select>
          </div>

          {visualizerConfig?.chaicodeUrl && (
            <a
              href={visualizerConfig.chaicodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span>ChaiCode Native View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
