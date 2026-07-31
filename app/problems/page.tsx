'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle,
  Circle,
  Code2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Zap,
  PlayCircle,
  Brain,
  Layers,
} from 'lucide-react';
import { Problem } from '@/lib/types';
import { ProblemListSkeleton } from '@/components/ui/Skeletons';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';

const TOPIC_OPTIONS = [
  'All Topics',
  'Arrays',
  'Hash Table',
  'Linked List',
  'Math',
  'Two Pointers',
  'Binary Search',
  'Sliding Window',
  'Dynamic Programming',
  'Stack',
  'Queue',
  'Tree',
  'Graph',
  'Heap',
  'Trie',
  'Backtracking',
  'Greedy',
  'Bit Manipulation',
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [visualizedOnly, setVisualizedOnly] = useState<boolean>(false);

  // Set of 75 visualizer problem IDs
  const [visualizerMap, setVisualizerMap] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetch('/data/visualizers.json')
      .then((res) => res.json())
      .then((data) => {
        if (data) setVisualizerMap(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');

      if (searchTerm) params.set('search', searchTerm);
      if (selectedDifficulty !== 'ALL' && selectedDifficulty !== 'VISUALIZED') {
        params.set('difficulty', selectedDifficulty);
      }
      if (selectedTopic !== 'All Topics') params.set('topic', selectedTopic);

      const res = await fetch(`/api/problems?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let fetchedProblems: Problem[] = data.problems || [];

        // If Visualized filter is active, filter to the 75 visualizer problems
        if (selectedDifficulty === 'VISUALIZED' || visualizedOnly) {
          fetchedProblems = fetchedProblems.filter((p) => visualizerMap[p.id]);
        }

        setProblems(fetchedProblems);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedDifficulty, selectedTopic, visualizedOnly, visualizerMap]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulty(diff);
    if (diff === 'VISUALIZED') {
      setVisualizedOnly(true);
    } else {
      setVisualizedOnly(false);
    }
    setPage(1);
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setPage(1);
  };

  const getDifficultyBadge = (difficulty: string) => {
    return <DifficultyBadge difficulty={difficulty} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-cyan-950/40 border border-slate-800 p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Featured Collection: 75 Animated Step Visualizers
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium">
                <Zap className="w-3.5 h-3.5" />
                Piston & Judge0 Code Engine
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              DSA Problem Practice Set
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Master Data Structures & Algorithms with 600+ problems, custom test case runners, and 
              <strong className="text-purple-400 font-semibold"> 75 Step-by-Step Animated Visualizers</strong> (Two Pointers, Sliding Window, DP, Trees & Graphs).
            </p>

            {/* Quick Action Button for Visualizers Collection */}
            <div className="pt-2">
              <button
                onClick={() => handleDifficultyChange('VISUALIZED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shadow-lg ${
                  selectedDifficulty === 'VISUALIZED'
                    ? 'bg-purple-500 text-slate-950 border-purple-400 shadow-purple-950/50'
                    : 'bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border-purple-800/60'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Browse 75 Animated Visualizer Problems</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filter Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-lg"
        >
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search problem title or keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium transition"
            />
          </div>

          {/* Difficulty & Visualized Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
            {['ALL', 'EASY', 'MEDIUM', 'HARD', 'VISUALIZED'].map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                  selectedDifficulty === diff
                    ? diff === 'VISUALIZED'
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-700 shadow'
                      : 'bg-slate-800 text-cyan-300 shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff === 'VISUALIZED' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>🎨 Visualized (75)</span>
                  </>
                ) : diff === 'ALL' ? (
                  'All'
                ) : (
                  diff.charAt(0) + diff.slice(1).toLowerCase()
                )}
              </button>
            ))}
          </div>

          {/* Topic Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Problems Table */}
        {isLoading ? (
          <ProblemListSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">Status</th>
                    <th className="py-3.5 px-6">Problem Title</th>
                    <th className="py-3.5 px-4 text-center">Difficulty</th>
                    <th className="py-3.5 px-6">Topics</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {problems.length > 0 ? (
                    problems.map((prob) => {
                      const isSolved = false; // Resolved via localStorage
                      const hasVis = !!visualizerMap[prob.id];

                      return (
                        <tr
                          key={prob.id}
                          className="hover:bg-slate-800/40 transition duration-150 group"
                        >
                          {/* Status Icon */}
                          <td className="py-4 px-4 text-center">
                            {isSolved ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-700 mx-auto group-hover:text-slate-500 transition" />
                            )}
                          </td>

                          {/* Title & Slug Link */}
                          <td className="py-4 px-6 font-medium text-slate-200">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/problems/${prob.slug}`}
                                className="hover:text-cyan-400 transition font-semibold group-hover:translate-x-0.5 transform duration-150"
                              >
                                {prob.title}
                              </Link>
                              {hasVis && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <span>Animated Visualizer</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Difficulty Badge */}
                          <td className="py-4 px-4 text-center">
                            {getDifficultyBadge(prob.difficulty)}
                          </td>

                          {/* Topic Tags */}
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1.5">
                              {prob.topicTags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
                                >
                                  {tag}
                                </span>
                              ))}
                              {prob.topicTags.length > 3 && (
                                <span className="px-1.5 py-0.5 text-[10px] text-slate-500 font-medium">
                                  +{prob.topicTags.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action CTA */}
                          <td className="py-4 px-4 text-right">
                            <Link
                              href={`/problems/${prob.slug}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/50 hover:border-cyan-700 transition"
                            >
                              <span>Solve</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                        No problems found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 text-sm text-slate-400 border-t border-slate-800">
            <div>
              Showing page <span className="font-semibold text-white">{page}</span> of{' '}
              <span className="font-semibold text-white">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
