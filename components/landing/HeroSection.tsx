'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Bot,
  Code2,
  Building2,
  Zap,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const stats = [
    {
      label: 'DSA Problems',
      value: '600+',
      sub: 'Arrays to Dynamic Programming',
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
    },
    {
      label: 'Tech Companies',
      value: '8',
      sub: 'Google, Meta, Amazon, Apple...',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    },
    {
      label: 'Piston Execution',
      value: '100%',
      sub: 'Isolated Sandbox Code Runner',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    },
    {
      label: 'AI Assistant',
      value: 'FreeModel',
      sub: 'Instant Tutor & Hints',
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
    },
  ];

  return (
    <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Radiant Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/15 to-purple-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Feature Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-950/30 mb-8"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>Next-Gen Competitive Coding & AI Interview Platform</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
      </motion.div>

      {/* Gradient Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.1]"
      >
        Master Coding & Crack Tech Interviews with{' '}
        <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent underline decoration-cyan-500/30 underline-offset-8">
          AI
        </span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 max-w-3xl text-base sm:text-xl text-slate-400 leading-relaxed font-normal"
      >
        Solve curated Data Structures & Algorithms, execute code in 5 languages via Piston, compete in Codeforces-style rated contests, and get instant AI code reviews & hints.
      </motion.p>

      {/* CTA Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="/problems"
          className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Explore Problems</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/mock-interview"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 font-semibold text-xs transition-all backdrop-blur-xl hover:border-cyan-500/40"
        >
          <Bot className="w-5 h-5 text-cyan-400" />
          <span>Try AI Mock Interview</span>
        </Link>
      </motion.div>

      {/* Stats Ticker Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl"
      >
        {stats.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl p-6 text-left flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">{item.icon}</span>
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{item.value}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">{item.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
