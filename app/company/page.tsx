'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CompanySummary } from '@/app/api/company/route';
import { Building2, ArrowRight, Search, Loader2, Sparkles } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/Skeletons';

export default function CompanyDirectoryPage() {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCompanies() {
      try {
        const res = await fetch('/api/company', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch companies');
        const data = await res.json();
        setCompanies(data.companies || []);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchCompanies();

    return () => controller.abort();
  }, []);

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-950/40">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top Tech Company Interview Prep
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curated problem sets & system design scenarios tagged by top tech giants
          </p>
        </div>

      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          aria-label="Filter companies"
          placeholder="Filter by company name or domain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium transition"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCompanies.map((comp, idx) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/company/${comp.slug}`}
                className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between backdrop-blur-xl h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                      <Building2 className="w-7 h-7 text-amber-400" aria-hidden="true" />
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                      {comp.problemCount} Problems
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>View Question Bank</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
