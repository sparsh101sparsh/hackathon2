'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Lightbulb, Target, RefreshCw } from 'lucide-react';

interface WeeklyReportData {
  summary: string;
  strengths: string[];
  focusAreas: string[];
  recommendations: string[];
  estimatedRatingGain: number;
}

export function WeeklyAiInsights() {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/weekly-report');
      if (!res.ok) throw new Error('Failed to load AI Insights');
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-purple-950/40 border border-indigo-800/40 rounded-xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              🤖 Weekly AI Progress Insights
            </h3>
            <p className="text-xs text-indigo-200/70">
              Powered by FreeModel API (gpt-5.4-mini)
            </p>
          </div>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
          title="Refresh AI Insights"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs">Analyzing submission patterns & rating trajectory...</p>
        </div>
      )}

      {error && !loading && (
        <div className="py-4 text-center text-xs text-rose-400">
          Failed to load AI Insights. Please try refreshing.
        </div>
      )}

      {report && !loading && (
        <div className="space-y-4 text-xs">
          {/* Executive Summary */}
          <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-lg p-3 text-indigo-100 leading-relaxed font-medium">
            "{report.summary}"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Strengths */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Key Strengths</span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {report.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Focus Areas */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>Focus Areas</span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {report.focusAreas?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations & Estimated Gain */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-indigo-400 mb-2">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>AI Recommendations</span>
                </div>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {report.recommendations?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-indigo-300 font-semibold">
                <span>Potential Rating Gain:</span>
                <span className="text-emerald-400 font-bold">
                  +{report.estimatedRatingGain || 45} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
