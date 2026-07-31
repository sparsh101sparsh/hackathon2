'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Sparkles } from 'lucide-react';
import { ProblemVisualizer } from '@/components/problems/ProblemVisualizer';
import visualizerData from '../../public/data/visualizers.json';

interface VisualizerEntry {
  problemId: string;
  pattern: string;
  lessonPath: string;
  hasVisualizer: boolean;
  slug?: string;
}

const patternLabels: Record<string, string> = {
  'two-pointers': 'Two Pointers',
  'arrays-hashing': 'Arrays & Hashing',
  'sliding-window': 'Sliding Window',
  stack: 'Stack',
  'linked-list': 'Linked List',
  heap: 'Heap',
  'binary-search': 'Binary Search',
  dfs: 'Depth-First Search',
  bfs: 'Breadth-First Search',
  graphs: 'Graphs',
  dp: 'Dynamic Programming',
  backtracking: 'Backtracking',
  greedy: 'Greedy',
  intervals: 'Intervals',
  'prefix-sum': 'Prefix Sum',
  matrices: 'Matrix Traversal',
  'bit-manipulation': 'Bit Manipulation',
};

function titleFromPath(path: string) {
  const slug = path.split('/').pop() || 'algorithm';
  return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const catalogEntries = Object.values(visualizerData) as VisualizerEntry[];

export default function VisualizerLibraryPage() {
  const [entries] = useState<VisualizerEntry[]>(catalogEntries);
  const [problemMeta, setProblemMeta] = useState<Record<string, { title: string; slug: string }>>({});
  const [selectedId, setSelectedId] = useState(catalogEntries[0]?.problemId || '');
  const [query, setQuery] = useState('');
  const [pattern, setPattern] = useState('all');

  useEffect(() => {
    const ids = entries.map((entry) => entry.problemId).join(',');
    const controller = new AbortController();
    fetch(`/api/problems?ids=${encodeURIComponent(ids)}&limit=100`, { signal: controller.signal })
      .then(async (response) => (response.ok ? response.json() : { problems: [] }))
      .then((data) => {
        if (controller.signal.aborted) return;
        const titleMap = Object.fromEntries(
          (data.problems || []).map((problem: { id: string; title: string; slug: string }) => [problem.id, { title: problem.title, slug: problem.slug }]),
        );
        setProblemMeta(titleMap);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setProblemMeta({});
      });
    return () => controller.abort();
  }, [entries]);

  const filteredEntries = useMemo(() => entries.filter((entry) => {
    const title = problemMeta[entry.problemId]?.title || titleFromPath(entry.lessonPath);
    const matchesQuery = `${title} ${entry.pattern}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (pattern === 'all' || entry.pattern === pattern);
  }), [entries, problemMeta, query, pattern]);

  const selected = entries.find((entry) => entry.problemId === selectedId) || filteredEntries[0];
  const selectedTitle = selected ? (problemMeta[selected.problemId]?.title || titleFromPath(selected.lessonPath)) : 'Choose a lesson';
  const patterns = Array.from(new Set(entries.map((entry) => entry.pattern)));

  useEffect(() => {
    if (selected && !filteredEntries.some((entry) => entry.problemId === selected.problemId)) {
      setSelectedId(filteredEntries[0]?.problemId || '');
    }
  }, [filteredEntries, selected]);

  return (
    <main className="min-h-screen bg-[#08080a] text-slate-200 px-4 sm:px-6 lg:px-8 py-8 font-mono">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            <div className="retro-label mb-3"><span>$ visualizer --catalog=75</span></div>
            <h1 className="font-mono text-3xl sm:text-5xl font-medium tracking-normal phosphor-glow">Watch the algorithm think<span className="text-amber-400">_</span></h1>
            <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed">Interactive visual lessons for every mapped problem. Choose a pattern, step through its state, and inspect the invariant.</p>
          </div>
          <div className="text-sm text-slate-400"><span className="text-slate-100 font-bold">{entries.length || 75}</span> verified lessons</div>
        </div>

        <div className="grid xl:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          <aside className="border border-white/10 bg-[#0f0f12] rounded-xl p-4 xl:sticky xl:top-24">
            <div className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-xs text-slate-400 mb-4"><Search className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" /><input aria-label="Search visualizer lessons" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="search lessons..." className="bg-transparent outline-none w-full placeholder:text-slate-500 text-slate-200" /></div>
            <select value={pattern} onChange={(event) => setPattern(event.target.value)} aria-label="Filter visualizer patterns" className="w-full bg-[#111115] border border-white/10 rounded-lg px-3 py-2 text-xs mb-4 text-slate-200"><option value="all">All patterns</option>{patterns.map((item) => <option key={item} value={item}>{patternLabels[item] || item}</option>)}</select>
            <div className="max-h-[55vh] overflow-y-auto space-y-1 pr-1">{filteredEntries.map((entry) => { const title = problemMeta[entry.problemId]?.title || titleFromPath(entry.lessonPath); return <button key={entry.problemId} type="button" onClick={() => setSelectedId(entry.problemId)} className={`w-full text-left p-3 rounded-lg transition border ${entry.problemId === selected?.problemId ? 'bg-amber-400/10 border-amber-400/50 text-amber-300 font-semibold' : 'border-transparent hover:border-white/10 hover:bg-[#18181d]'}`}><div className="font-sans text-sm text-slate-200 leading-snug">{title}</div><div className="text-[10px] text-slate-400 mt-1">{patternLabels[entry.pattern] || entry.pattern}</div></button>; })}</div>
          </aside>

          <section className="min-w-0">
            {selected ? <ProblemVisualizer key={selected.problemId} problemId={selected.problemId} problemTitle={selectedTitle} topicTags={JSON.stringify([selected.pattern])} verified={selected.hasVisualizer} /> : <div className="border border-slate-800 rounded-2xl p-10 text-center text-slate-500">No lessons match this filter.</div>}
            {selected && <div className="flex flex-wrap justify-between items-center gap-3 mt-4 text-xs text-slate-400"><span>Interactive lesson: {selected.lessonPath}</span><Link href={`/problems/${problemMeta[selected.problemId]?.slug || selected.problemId}`} className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold">Open coding workspace <ChevronRight className="w-3.5 h-3.5" /></Link></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
