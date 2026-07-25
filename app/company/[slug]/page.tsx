'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CompanyProblemItem } from '@/app/api/company/[slug]/route';
import { Building2, ChevronLeft, Search, ExternalLink, Loader2, Zap } from 'lucide-react';

interface CompanyDetailData {
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    description: string;
    problemCount: number;
  };
  problems: CompanyProblemItem[];
}

export default function CompanyDetailPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<CompanyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFreq, setFilterFreq] = useState<'ALL' | 'High' | 'Medium' | 'Low'>('ALL');

  useEffect(() => {
    async function fetchCompanyDetail() {
      try {
        const res = await fetch(`/api/company/${params.slug}`);
        if (!res.ok) throw new Error('Failed to fetch company details');
        const detail = await res.json();
        setData(detail);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyDetail();
  }, [params.slug]);

  const filteredProblems = data?.problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topicTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFreq = filterFreq === 'ALL' || p.frequencyTag === filterFreq;
    return matchesSearch && matchesFreq;
  }) || [];

  const getFreqBadge = (freqTag: 'High' | 'Medium' | 'Low') => {
    switch (freqTag) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3 text-rose-400" />
            High Frequency
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Medium Frequency
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            Low Frequency
          </span>
        );
    }
  };

  const getDiffBadge = (diff: string) => {
    switch (diff.toUpperCase()) {
      case 'EASY':
        return <span className="font-bold text-emerald-400">Easy</span>;
      case 'MEDIUM':
        return <span className="font-bold text-amber-400">Medium</span>;
      case 'HARD':
        return <span className="font-bold text-rose-400">Hard</span>;
      default:
        return <span className="font-bold text-slate-400">{diff}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Loading company question bank...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md">
          <h2 className="text-lg font-bold text-rose-400">Company Not Found</h2>
          <Link href="/company" className="mt-4 inline-block text-xs font-bold text-indigo-400 hover:underline">
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation & Company Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm space-y-3">
        <Link href="/company" className="text-xs text-indigo-400 flex items-center gap-1 hover:underline">
          <ChevronLeft className="w-4 h-4" />
          Back to Tech Companies Directory
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
              {data.company.logo}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {data.company.name} Interview Questions
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">{data.company.description}</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center shrink-0 min-w-[140px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Curated Problems
            </span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-0.5">
              {data.company.problemCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Frequency Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Interview Frequency:</span>
          {(['ALL', 'High', 'Medium', 'Low'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => setFilterFreq(freq)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filterFreq === freq
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Title & Topics</th>
                <th className="py-3.5 px-4 font-semibold">Interview Frequency</th>
                <th className="py-3.5 px-4 font-semibold text-center">Difficulty</th>
                <th className="py-3.5 px-4 font-semibold text-center">Acceptance</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProblems.map((prob) => (
                <tr key={prob.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {prob.title}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prob.topicTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-400 border border-slate-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">{getFreqBadge(prob.frequencyTag)}</td>

                  <td className="py-3.5 px-4 text-center">{getDiffBadge(prob.difficulty)}</td>

                  <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                    {prob.acceptanceRate}%
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/problems/${prob.slug}`}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <span>Solve</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
