'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Terminal,
  Sparkles,
  Lightbulb,
  Trophy,
  BarChart3,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const CoreFeaturesGrid: React.FC = () => {
  const features = [
    {
      title: 'Judge0 Execution Engine',
      desc: 'Secure containerized sandbox executing C++, Python, JavaScript, Java, and Go in milliseconds with detailed verdict output.',
      icon: <Terminal className="w-6 h-6 text-cyan-400" />,
      badge: 'Sandboxed Runner',
      link: '/problems',
      color: 'hover:border-cyan-500/50 hover:shadow-cyan-950/40',
    },
    {
      title: 'Automated Code Audit',
      desc: 'Get instant analysis on time/space complexity, edge case vulnerabilities, and refactoring suggestions powered by FreeModel.',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      badge: 'FreeModel',
      link: '/problems',
      color: 'hover:border-purple-500/50 hover:shadow-purple-950/40',
    },
    {
      title: '3-Level Progressive Hints',
      desc: 'Never get stuck again. Unlock hints incrementally: 1) High-level strategy, 2) Algorithmic breakdown, 3) Pseudocode structure.',
      icon: <Lightbulb className="w-6 h-6 text-amber-400" />,
      badge: 'Zero Spoilers',
      link: '/problems',
      color: 'hover:border-amber-500/50 hover:shadow-amber-950/40',
    },
    {
      title: 'Codeforces Rated Contests',
      desc: 'Compete in weekly timed rated contests with live scoreboard standings, penalty calculations, and Elo rating updates (800 - 3500).',
      icon: <Trophy className="w-6 h-6 text-emerald-400" />,
      badge: 'Elo Rating System',
      link: '/contests',
      color: 'hover:border-emerald-500/50 hover:shadow-emerald-950/40',
    },
    {
      title: 'Recharts Analytics Dashboard',
      desc: 'Visualize topic mastery with radar charts, track rating progression curves, and maintain your GitHub-style activity heatmaps.',
      icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
      badge: 'Visual Insights',
      link: '/dashboard',
      color: 'hover:border-indigo-500/50 hover:shadow-indigo-950/40',
    },
    {
      title: 'Company Specific Prep',
      desc: 'Curated problem collections tagged by Google, Meta, Amazon, Apple, and Netflix, complete with frequency tags.',
      icon: <Building2 className="w-6 h-6 text-rose-400" />,
      badge: '8 Tech Giants',
      link: '/company',
      color: 'hover:border-rose-500/50 hover:shadow-rose-950/40',
    },
  ];

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Complete Competitive Engineering Suite</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Everything You Need to Master DSA
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Built for software engineers, competitive programmers, and tech interview candidates seeking a high-performance practice platform.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group shadow-xl ${item.color}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 text-slate-300 border border-slate-800">
                  {item.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href={item.link}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition group-hover:translate-x-1"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
