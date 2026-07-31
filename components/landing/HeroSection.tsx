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
      icon: <Code2 className="w-5 h-5 text-amber-300" />,
      color: 'border-amber-400/30',
    },
    {
      label: 'Tech Companies',
      value: '8',
      sub: 'Google, Meta, Amazon, Apple...',
      icon: <Building2 className="w-5 h-5 text-amber-300" />,
      color: 'border-amber-400/30',
    },
    {
      label: 'Judge0 Execution',
      value: 'CE',
      sub: 'Isolated Sandbox Code Runner',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-400/30',
    },
    {
      label: 'Guided Practice',
      value: 'FreeModel',
      sub: 'Instant Tutor & Hints',
      icon: <Bot className="w-5 h-5 text-amber-300" />,
      color: 'border-amber-400/30',
    },
  ];

  return (
    <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Radiant Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-400/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Feature Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111115] border border-amber-400/30 text-amber-300 text-xs font-semibold shadow-lg shadow-amber-950/20 mb-8"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Focused Competitive Coding & Interview Platform</span>
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
        <span className="text-amber-300 underline decoration-amber-400/30 underline-offset-8">
          CodeForge
        </span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 max-w-3xl text-base sm:text-xl text-slate-400 leading-relaxed font-normal"
      >
        Solve curated Data Structures & Algorithms, execute code in 5 languages via Judge0, compete in Codeforces-style rated contests, and get instant code reviews & hints.
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
          className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#08080a] font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Explore Problems</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/mock-interview"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#111115] hover:bg-[#17171b] text-slate-200 border border-white/10 font-semibold text-xs transition-all hover:border-amber-400/40"
        >
          <Bot className="w-5 h-5 text-amber-300" />
          <span>Try Mock Interview</span>
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
            className="rounded-xl bg-[#0f0f12] border border-white/10 shadow-xl p-6 text-left flex flex-col justify-between"
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
