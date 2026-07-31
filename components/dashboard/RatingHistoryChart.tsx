'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface RatingHistoryItem {
  date: string;
  rating: number;
  delta: number;
  contestTitle: string;
}

interface RatingHistoryChartProps {
  history: RatingHistoryItem[];
  currentRating: number;
}

export function RatingHistoryChart({ history, currentRating }: RatingHistoryChartProps) {
  const minRating = Math.max(800, Math.min(...history.map((h) => h.rating)) - 100);
  const maxRating = Math.min(3500, Math.max(...history.map((h) => h.rating)) + 100);

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            📈 Rating Progression History
          </h3>
          <p className="text-xs text-slate-400">
            Performance over time in CodeForge Rated Contests
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Current Rating</span>
          <div className="text-lg font-bold text-indigo-400">{currentRating}</div>
        </div>
      </div>

      <div className="w-full h-64 min-h-[240px] flex-1 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis
              domain={[minRating, maxRating]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as RatingHistoryItem;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-2.5 rounded shadow text-xs">
                      <p className="font-bold text-white">{data.contestTitle}</p>
                      <p className="text-slate-400">{data.date}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-bold text-indigo-400">Rating: {data.rating}</span>
                        <span
                          className={`font-semibold ${
                            data.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ({data.delta >= 0 ? `+${data.delta}` : data.delta})
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#818cf8"
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6, fill: '#38bdf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
