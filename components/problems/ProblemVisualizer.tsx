'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { getVisualizerLesson } from './visualizerLessons';
import { problemVisualizerScenarios, ProblemVisualizerScenario } from './problemVisualizerScenarios';
import { VisualizerScene } from './VisualizerScene';
import { VisualizerChatbot } from './VisualizerChatbot';

export type VisualType = 'array' | 'matrix' | 'stack' | 'nodes' | 'graph' | 'bars' | 'bits';

interface VisualizerConfig {
  pattern: string;
  lessonPath: string;
  hasVisualizer: boolean;
}

export interface LessonFrame {
  visualType: VisualType;
  values?: (string | number)[];
  matrix?: (string | number)[][];
  stack?: (string | number)[];
  nodes?: string[];
  edges?: [number, number][];
  active?: number[];
  pointers?: Record<string, number>;
  bars?: number[];
  bits?: string;
  codeLine: number;
  commentary: string;
  state: { label: string; value: string }[];
}

interface ProblemVisualizerProps {
  problemId: string;
  problemTitle: string;
  topicTags?: string | string[];
  verified?: boolean;
}

const patternNames: Record<string, string> = {
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

const defaultValues = [3, 8, 12, 17, 21, 26, 30];

function parsePattern(topicTags: string | string[] | undefined) {
  if (Array.isArray(topicTags)) return topicTags[0]?.toLowerCase() || 'arrays-hashing';
  if (typeof topicTags === 'string') {
    try {
      const parsed = JSON.parse(topicTags);
      if (Array.isArray(parsed)) return String(parsed[0] || 'arrays-hashing').toLowerCase();
    } catch {
      return topicTags.toLowerCase();
    }
  }
  return 'arrays-hashing';
}

function frame(
  visualType: VisualType,
  codeLine: number,
  commentary: string,
  state: [string, string][],
  extra: Partial<LessonFrame> = {},
): LessonFrame {
  return { visualType, codeLine, commentary, state: state.map(([label, value]) => ({ label, value })), ...extra };
}

function scenarioData(type: VisualType, slug: string, base: number[], step: number): Partial<LessonFrame> {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const active = [
    [0],
    [1, 2],
    [2, 3],
    [Math.max(0, base.length - 1)],
  ][step];

  if (type === 'array') {
    const pointers: Record<string, number> | undefined = slug.includes('binary-search')
      ? { lo: step === 0 ? 0 : step === 1 ? 2 : 4, mid: step === 0 ? 2 : step === 1 ? 4 : 4, hi: step === 0 ? 5 : step === 1 ? 5 : 4 }
      : slug.includes('palindrome') || slug.includes('container') || slug.includes('triangle') || slug.includes('two-sum')
        ? { L: step < 2 ? 0 : 1, R: step < 2 ? base.length - 1 : base.length - 2 }
        : undefined;
    return { values: base, active, pointers };
  }

  if (type === 'matrix') {
    const matrix = Array.from({ length: 4 }, (_, rowIndex) => Array.from({ length: 4 }, (_, colIndex) => {
      const value = (hash + rowIndex * 7 + colIndex * 3) % 2;
      return step === 0 ? value : step === 1 ? (rowIndex + colIndex < 3 ? 1 : value) : step === 2 ? (rowIndex + colIndex < 5 ? 1 : value) : 1;
    }));
    return { matrix, active: step === 0 ? [0] : step === 1 ? [0, 1, 4, 5] : step === 2 ? [5, 6, 9, 10] : [15] };
  }

  if (type === 'stack') {
    const stacks: (string | number)[][] = [[], ['('], ['(', '['], []];
    return { stack: stacks[step] };
  }

  if (type === 'nodes') {
    const suffix = slug.split('-').map((part) => part[0]?.toUpperCase() || '').join('').slice(0, 2);
    return { nodes: ['HEAD', suffix || 'A', 'B', 'C', 'TAIL'], active };
  }

  if (type === 'graph') {
    return { nodes: ['A', 'B', 'C', 'D', 'E'], edges: [[0, 1], [0, 2], [1, 3], [2, 4]], active: step === 0 ? [0] : step === 1 ? [0, 1] : step === 2 ? [0, 1, 2] : [0, 1, 2, 3, 4] };
  }

  if (type === 'bars') {
    return { bars: base.slice(0, 7).map((value, index) => Math.max(2, ((value + index * 3) % 10) + 1)), active };
  }

  const bits = ((hash >>> 0).toString(2).padStart(8, '0').slice(-8));
  return { bits: step === 0 ? bits : step === 1 ? bits.slice(1) + '0' : step === 2 ? bits.slice(2) + '00' : '00000000' };
}

function buildScenarioFrames(scenario: ProblemVisualizerScenario, slug: string, values: number[]): LessonFrame[] {
  return scenario.comments.map((commentary, index) => frame(
    scenario.visualType,
    index + 1,
    commentary,
    [['phase', scenario.phases[index]], ['step', `${index + 1} / ${scenario.comments.length}`]],
    scenarioData(scenario.visualType, slug, values, index),
  ));
}

function buildPatternFrames(pattern: string, title: string, lessonValues = defaultValues): LessonFrame[] {
  const lowerTitle = title.toLowerCase();
  const base = lessonValues;

  if (pattern === 'two-pointers' || lowerTitle.includes('two sum')) {
    return [
      frame('array', 1, 'Start at both ends. The search space is the full array.', [['left', '0'], ['right', '6'], ['sum', '33']], { values: base, active: [0, 6], pointers: { L: 0, R: 6 } }),
      frame('array', 3, '33 is too large, so move the right pointer inward.', [['left', '0'], ['right', '5'], ['sum', '29']], { values: base, active: [0, 5], pointers: { L: 0, R: 5 } }),
      frame('array', 4, '24 is still larger than the target. Keep shrinking from the right.', [['left', '0'], ['right', '4'], ['sum', '24']], { values: base, active: [0, 4], pointers: { L: 0, R: 4 } }),
      frame('array', 5, '20 is the first useful boundary. Advance left to make the sum larger.', [['left', '1'], ['right', '4'], ['sum', '20']], { values: base, active: [1, 4], pointers: { L: 1, R: 4 } }),
      frame('array', 6, '17 + 21 = 38. The converging pointers finish the search without backtracking.', [['left', '3'], ['right', '4'], ['answer', 'found']], { values: base, active: [3, 4], pointers: { L: 3, R: 4 } }),
    ];
  }

  if (pattern === 'sliding-window') {
    return [
      frame('array', 1, 'Open a window at the first element.', [['left', '0'], ['right', '0'], ['best', '3']], { values: base, active: [0], pointers: { L: 0, R: 0 } }),
      frame('array', 2, 'Expand right. The window now contains two candidates.', [['left', '0'], ['right', '2'], ['window', '3..12']], { values: base, active: [0, 1, 2], pointers: { L: 0, R: 2 } }),
      frame('array', 3, 'The window breaks its condition, so repair it from the left.', [['left', '1'], ['right', '3'], ['window', '8..17']], { values: base, active: [1, 2, 3], pointers: { L: 1, R: 3 } }),
      frame('array', 4, 'Record the valid window, then expand again.', [['left', '2'], ['right', '5'], ['best', '21']], { values: base, active: [2, 3, 4, 5], pointers: { L: 2, R: 5 } }),
    ];
  }

  if (pattern === 'binary-search') {
    return [
      frame('array', 1, 'Keep the answer inside the inclusive search interval.', [['lo', '0'], ['mid', '3'], ['hi', '6']], { values: base, active: [0, 3, 6], pointers: { lo: 0, mid: 3, hi: 6 } }),
      frame('array', 3, 'The midpoint is too small. Discard the left half.', [['lo', '4'], ['mid', '5'], ['hi', '6']], { values: base, active: [4, 5, 6], pointers: { lo: 4, mid: 5, hi: 6 } }),
      frame('array', 4, 'The interval has collapsed to the answer candidate.', [['lo', '5'], ['mid', '5'], ['hi', '5']], { values: base, active: [5], pointers: { lo: 5, mid: 5, hi: 5 } }),
    ];
  }

  if (pattern === 'stack') {
    return [
      frame('stack', 1, 'Read the next token. The stack remembers unresolved work.', [['token', '('], ['top', '('], ['depth', '1']], { stack: ['('] }),
      frame('stack', 2, 'A matching closer resolves the most recent opener first.', [['token', ')'], ['top', '('], ['depth', '0']], { stack: [] }),
      frame('stack', 4, 'Push the next nested pair; last in is first out.', [['token', '['], ['top', '['], ['depth', '1']], { stack: ['['] }),
      frame('stack', 5, 'The empty stack confirms every pair was resolved.', [['token', 'done'], ['valid', 'true'], ['depth', '0']], { stack: [] }),
    ];
  }

  if (pattern === 'linked-list') {
    return [
      frame('nodes', 1, 'Keep a stable previous pointer while current walks the list.', [['prev', 'null'], ['current', 'A'], ['next', 'B']], { nodes: ['A', 'B', 'C', 'D'], active: [0] }),
      frame('nodes', 2, 'Save next before changing the arrow.', [['prev', 'A'], ['current', 'B'], ['next', 'C']], { nodes: ['A', 'B', 'C', 'D'], active: [1] }),
      frame('nodes', 3, 'Reverse one link, then advance both pointers.', [['prev', 'B'], ['current', 'C'], ['next', 'D']], { nodes: ['B', 'A', 'C', 'D'], active: [1, 2] }),
      frame('nodes', 5, 'When current is null, prev is the new head.', [['head', 'D'], ['current', 'null'], ['links', 'reversed']], { nodes: ['D', 'C', 'B', 'A'], active: [0] }),
    ];
  }

  if (pattern === 'dp') {
    return [
      frame('matrix', 1, 'Start with the smallest subproblem and write its base case.', [['row', '0'], ['col', '0'], ['value', '1']], { matrix: [[1, 1, 1, 1], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]], active: [0] }),
      frame('matrix', 2, 'Each cell reuses answers from its already-solved neighbors.', [['row', '1'], ['col', '1'], ['value', '2']], { matrix: [[1, 1, 1, 1], [1, 2, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]], active: [0, 1, 4, 5] }),
      frame('matrix', 3, 'Fill the table left to right, top to bottom.', [['row', '2'], ['col', '2'], ['value', '3']], { matrix: [[1, 1, 1, 1], [1, 2, 2, 2], [1, 2, 3, 0], [1, 2, 0, 0]], active: [5, 6, 9, 10] }),
      frame('matrix', 5, 'The final cell contains the answer assembled from smaller states.', [['answer', '4'], ['time', 'O(mn)'], ['space', 'O(mn)']], { matrix: [[1, 1, 1, 1], [1, 2, 2, 2], [1, 2, 3, 3], [1, 2, 3, 4]], active: [15] }),
    ];
  }

  if (pattern === 'backtracking') {
    return [
      frame('nodes', 1, 'Choose a candidate and descend one level in the decision tree.', [['path', '[]'], ['depth', '0'], ['choices', '3']], { nodes: ['start', '1', '2', '3'], active: [0] }),
      frame('nodes', 2, 'Commit to 1. The remaining choices form a smaller problem.', [['path', '[1]'], ['depth', '1'], ['choices', '2']], { nodes: ['start', '1', '2', '3'], active: [0, 1] }),
      frame('nodes', 3, 'Try 2, then recurse again. Each branch owns its local state.', [['path', '[1, 2]'], ['depth', '2'], ['choices', '1']], { nodes: ['start', '1', '2', '3'], active: [0, 1, 2] }),
      frame('nodes', 5, 'Undo the last choice and return to the previous branch.', [['path', '[1]'], ['depth', '1'], ['backtrack', 'yes']], { nodes: ['start', '1', '2', '3'], active: [0, 1] }),
    ];
  }

  if (pattern === 'greedy' || pattern === 'intervals') {
    return [
      frame('bars', 1, 'Sort or scan candidates so the locally best choice is visible.', [['current', '3'], ['best', '3'], ['covered', '1']], { bars: [3, 6, 4, 9, 5, 7], active: [0] }),
      frame('bars', 2, 'Take the choice that leaves the most room for what comes next.', [['current', '6'], ['best', '6'], ['covered', '2']], { bars: [3, 6, 4, 9, 5, 7], active: [1, 2] }),
      frame('bars', 3, 'A larger next candidate replaces the previous best.', [['current', '9'], ['best', '9'], ['covered', '4']], { bars: [3, 6, 4, 9, 5, 7], active: [3, 4] }),
      frame('bars', 5, 'The greedy invariant holds through the final candidate.', [['answer', '9'], ['time', 'O(n log n)'], ['space', 'O(1)']], { bars: [3, 6, 4, 9, 5, 7], active: [3] }),
    ];
  }

  if (pattern === 'graphs' || pattern === 'dfs' || pattern === 'bfs') {
    return [
      frame('graph', 1, 'Begin at the source and mark it before exploring neighbors.', [['current', 'A'], ['visited', '{A}'], ['frontier', '{B, C}']], { nodes: ['A', 'B', 'C', 'D', 'E'], edges: [[0, 1], [0, 2], [1, 3], [2, 4]], active: [0] }),
      frame('graph', 2, 'Visit B. Its unvisited neighbor enters the frontier.', [['current', 'B'], ['visited', '{A, B}'], ['frontier', '{C, D}']], { nodes: ['A', 'B', 'C', 'D', 'E'], edges: [[0, 1], [0, 2], [1, 3], [2, 4]], active: [0, 1] }),
      frame('graph', 3, 'Visit C next and add its remaining neighbor.', [['current', 'C'], ['visited', '{A, B, C}'], ['frontier', '{D, E}']], { nodes: ['A', 'B', 'C', 'D', 'E'], edges: [[0, 1], [0, 2], [1, 3], [2, 4]], active: [0, 1, 2] }),
      frame('graph', 5, 'The frontier is empty. Every reachable node is accounted for.', [['visited', '5 nodes'], ['frontier', '{}'], ['done', 'true']], { nodes: ['A', 'B', 'C', 'D', 'E'], edges: [[0, 1], [0, 2], [1, 3], [2, 4]], active: [0, 1, 2, 3, 4] }),
    ];
  }

  if (pattern === 'bit-manipulation') {
    return [
      frame('bits', 1, 'Inspect the least significant bit with a mask.', [['value', '0101'], ['mask', '0001'], ['answer', '0']], { bits: '0101' }),
      frame('bits', 2, 'Shift the value so the next bit moves into position.', [['value', '0010'], ['mask', '0001'], ['answer', '1']], { bits: '0010' }),
      frame('bits', 3, 'Combine the bit into the answer and continue shifting.', [['value', '0001'], ['mask', '0001'], ['answer', '2']], { bits: '0001' }),
      frame('bits', 5, 'All bits are consumed. The result came from constant-space operations.', [['value', '0000'], ['answer', '2'], ['time', 'O(log n)']], { bits: '0000' }),
    ];
  }

  if (pattern === 'matrices') {
    return [
      frame('matrix', 1, 'Anchor the traversal at the top-left cell.', [['row', '0'], ['col', '0'], ['visited', '1']], { matrix: [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], active: [0] }),
      frame('matrix', 2, 'Move across the current boundary before turning inward.', [['row', '0'], ['col', '2'], ['visited', '3']], { matrix: [[1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]], active: [0, 1, 2] }),
      frame('matrix', 3, 'Turn when the next cell leaves the active boundary.', [['row', '1'], ['col', '3'], ['visited', '6']], { matrix: [[1, 1, 1, 1], [0, 0, 0, 1], [0, 0, 0, 0]], active: [3, 7] }),
      frame('matrix', 5, 'Repeat until every layer of the matrix has been visited.', [['visited', '12'], ['layers', '3'], ['done', 'true']], { matrix: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]], active: [11] }),
    ];
  }

  if (pattern === 'prefix-sum') {
    return [
      frame('array', 1, 'Build a running total so every range can be answered by subtraction.', [['index', '0'], ['prefix', '3']], { values: base, active: [0] }),
      frame('array', 2, 'Add the next value to the prefix state.', [['index', '2'], ['prefix', '23']], { values: base, active: [0, 1, 2] }),
      frame('array', 4, 'A range sum is prefix[right] minus prefix[left - 1].', [['left', '1'], ['right', '4'], ['sum', '58']], { values: base, active: [1, 2, 3, 4] }),
      frame('array', 5, 'The query is answered without rescanning the range.', [['answer', '58'], ['time', 'O(1)'], ['space', 'O(n)']], { values: base, active: [1, 2, 3, 4] }),
    ];
  }

  if (pattern === 'heap') {
    return [
      frame('bars', 1, 'Keep the best k candidates in a heap, not in the whole array.', [['heap', '[3]'], ['size', '1'], ['top', '3']], { bars: [3, 8, 4, 7, 2, 9], active: [0] }),
      frame('bars', 2, 'A larger candidate rises to the top.', [['heap', '[8, 3]'], ['size', '2'], ['top', '8']], { bars: [3, 8, 4, 7, 2, 9], active: [1] }),
      frame('bars', 3, 'When the heap grows past k, remove its weakest member.', [['heap', '[8, 7, 4]'], ['size', '3'], ['top', '8']], { bars: [3, 8, 4, 7, 2, 9], active: [1, 3, 2] }),
      frame('bars', 5, 'The heap invariant leaves the requested extreme at the root.', [['answer', '9'], ['time', 'O(n log k)'], ['space', 'O(k)']], { bars: [3, 8, 4, 7, 2, 9], active: [5] }),
    ];
  }

  return [
    frame('array', 1, 'Scan the input and keep the invariant that makes the next decision cheap.', [['index', '0'], ['best', '3']], { values: base, active: [0] }),
    frame('array', 2, 'Update the state with the current value.', [['index', '2'], ['best', '12']], { values: base, active: [2] }),
    frame('array', 4, 'The invariant carries the useful information forward.', [['index', '5'], ['best', '26']], { values: base, active: [5] }),
    frame('array', 6, 'The final state is the answer.', [['answer', '30'], ['time', 'O(n)'], ['space', 'O(1)']], { values: base, active: [6] }),
  ];
}

function decorateLessonFrames(frames: LessonFrame[], lessonPath: string, pattern: string) {
  const profile = getVisualizerLesson(lessonPath, pattern);
  return frames.map((item, index) => {
    const state = [...item.state];
    if (index === 0) state.unshift({ label: 'input', value: profile.input });
    if (index === frames.length - 1) state.push({ label: 'output', value: profile.output });
    return {
      ...item,
      codeLine: Math.min(item.codeLine, profile.code.length),
      commentary: index === 0
        ? `${profile.focus}. ${item.commentary}`
        : index === frames.length - 1
          ? `${item.commentary} Result: ${profile.output}.`
          : item.commentary,
      state,
    };
  });
}

export function buildVisualizerFrames(pattern: string, title: string, lessonPath = title): LessonFrame[] {
  const profile = getVisualizerLesson(lessonPath, pattern);
  const scenario = problemVisualizerScenarios[profile.slug];
  const frames = scenario
    ? buildScenarioFrames(scenario, profile.slug, profile.values || defaultValues)
    : buildPatternFrames(pattern, title, profile.values);
  return decorateLessonFrames(frames, lessonPath, pattern);
}

const codeByPattern: Record<string, string[]> = {
  'two-pointers': ['left = 0; right = n - 1', 'while left < right:', '  inspect arr[left] and arr[right]', '  move the pointer that improves the invariant', 'return the answer'],
  'sliding-window': ['left = 0', 'for right in range(n):', '  expand the window', '  repair while the condition is broken', '  record the best window'],
  'binary-search': ['lo = 0; hi = n - 1', 'while lo <= hi:', '  mid = (lo + hi) // 2', '  discard the impossible half', 'return the candidate'],
  stack: ['stack = []', 'for token in input:', '  inspect the top of the stack', '  push or resolve the pending work', 'return stack is empty'],
  'linked-list': ['prev = None; current = head', 'while current:', '  next = current.next', '  reverse one link', 'return prev'],
  dp: ['dp = base_cases()', 'for each subproblem:', '  read solved neighbors', '  write the current state', 'return dp[target]'],
  backtracking: ['def search(state):', '  if state is complete:', '    record the answer', '  choose -> recurse -> undo', 'return all answers'],
  graphs: ['frontier = [source]', 'while frontier:', '  current = remove frontier head', '  visit unvisited neighbors', 'return visited'],
  dfs: ['def dfs(node):', '  mark node visited', '  for neighbor in node.neighbors:', '    dfs(neighbor)', 'return'],
  bfs: ['queue = [source]', 'while queue:', '  current = queue.pop(0)', '  enqueue unvisited neighbors', 'return distance'],
};

function codeFor(pattern: string, lessonPath?: string) {
  if (lessonPath) return getVisualizerLesson(lessonPath, pattern).code;
  return codeByPattern[pattern] || ['state = initial_state()', 'for item in input:', '  inspect the invariant', '  update the state', 'return answer'];
}

function pointerColor(name: string) {
  const palette: Record<string, string> = { L: 'text-orange-300', R: 'text-cyan-300', lo: 'text-orange-300', hi: 'text-cyan-300', mid: 'text-yellow-200', left: 'text-orange-300', right: 'text-cyan-300' };
  return palette[name] || 'text-orange-300';
}

export const ProblemVisualizer: React.FC<ProblemVisualizerProps> = ({ problemId, problemTitle, topicTags, verified = false }) => {
  const [config, setConfig] = useState<VisualizerConfig | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<'concept' | 'practice'>('concept');
  const [speed, setSpeed] = useState(1200);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/data/visualizers.json')
      .then((response) => response.json())
      .then((data) => mounted && setConfig(data[problemId] || null))
      .catch(() => mounted && setConfig(null));
    return () => { mounted = false; };
  }, [problemId]);

  const pattern = config?.pattern || parsePattern(topicTags);
  const lessonPath = config?.lessonPath || problemTitle;
  const frames = useMemo(() => buildVisualizerFrames(pattern, problemTitle, lessonPath), [pattern, problemTitle, lessonPath]);
  const isVerified = verified || Boolean(config?.hasVisualizer);
  const code = codeFor(pattern, lessonPath);
  const current = frames[Math.min(step, frames.length - 1)];
  const progress = (step / Math.max(frames.length - 1, 1)) * 100;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((value) => {
        if (value >= frames.length - 1) { setPlaying(false); return value; }
        return value + 1;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, frames.length]);

  useEffect(() => { setStep(0); setPlaying(false); }, [problemId, pattern]);

  const copyCode = async () => {
    const text = code.join('\n');
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-[640px] bg-[#1d2021] text-[#ebdbb2] border border-[#928374] rounded overflow-hidden font-mono">
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_320px] min-h-[640px]">
        <aside className="hidden lg:flex flex-col border-r border-[#4b483e] bg-[#11110f] p-4 gap-6">
          <div>
            <div className="text-[11px] text-[#8b877a] mb-2">PATTERN</div>
            <div className="text-xl font-bold font-sans text-[#f7f3ea]">{patternNames[pattern] || 'DSA Visual'}</div>
            <div className="text-[11px] text-[#969184] mt-2 leading-relaxed">step-by-step pattern animations</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border border-[#5d594d] rounded-lg text-xs text-[#aaa496]">
            <Search className="w-3.5 h-3.5" /> Search lessons
          </div>
          <div className="space-y-2 overflow-hidden">
            <div className="text-[10px] tracking-[0.18em] text-[#8b877a]">CURRENT LESSON</div>
            <div className="border-l-2 border-[#e98b5b] pl-3 text-sm text-[#f2eee4] leading-relaxed">{problemTitle}</div>
            <div className="text-[11px] text-[#8b877a]">{isVerified ? 'verified lesson' : 'pattern lesson'}</div>
          </div>
        </aside>

        <section className="flex flex-col min-w-0">
          <header className="px-5 sm:px-8 pt-5 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#aaa496]">{mode}</div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight mt-1">{problemTitle}</h2>
              <div className="inline-flex items-center gap-2 mt-3 border border-[#5d594d] rounded-lg px-3 py-2 text-xs text-[#d0cabd]">{patternNames[pattern] || 'Algorithm'} <span className="text-[#e98b5b]">{isVerified ? 'verified' : 'live'}</span></div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setMode('concept')} className={`px-3 py-2 rounded-lg text-xs border transition ${mode === 'concept' ? 'bg-[#f0e6d5] text-[#24211c] border-[#f0e6d5]' : 'border-[#5d594d] text-[#b4afa3]'}`}>Concept</button>
              <button type="button" onClick={() => setMode('practice')} className={`px-3 py-2 rounded-lg text-xs border transition ${mode === 'practice' ? 'bg-[#e98b5b] text-[#241812] border-[#e98b5b]' : 'border-[#5d594d] text-[#b4afa3]'}`}>Practice</button>
            </div>
          </header>

          <div className="px-5 sm:px-8 flex items-center justify-between text-[11px] text-[#a39d8f] mb-3"><span>{patternNames[pattern] || 'Algorithm'} walk</span><span>step {step + 1} / {frames.length}</span></div>

          <div className="px-5 sm:px-8 flex-1 grid xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,.75fr)] gap-5 items-center">
            <div className="min-h-[290px] flex items-center justify-center border-y border-[#39372f] py-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <VisualizerScene frame={current} step={step} />
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              <div className="border border-[#5d594d] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#4b483e]"><span className="font-sans font-bold text-lg">{mode === 'concept' ? 'Concept' : 'Practice'}</span><button type="button" onClick={copyCode} title="Copy pseudocode" className="px-2.5 py-1.5 border border-[#5d594d] rounded-md text-xs text-[#c7c0b2] flex items-center gap-1.5 hover:border-[#e98b5b]"><Copy className="w-3.5 h-3.5" /> {copied ? 'copied' : 'copy'}</button></div>
                <div className="p-4 space-y-2 text-xs leading-relaxed bg-[#1a1915]">{code.map((line, index) => <div key={line} className={`flex gap-3 px-2 py-1 rounded ${current.codeLine === index + 1 ? 'bg-[#493126] text-[#ffc199]' : 'text-[#938d80]'}`}><span className="w-4 text-right text-[#716b60]">{index + 1}</span><code>{line}</code></div>)}</div>
              </div>
              <div className="border border-[#5d594d] rounded-xl p-4 grid grid-cols-2 gap-3">{current.state.map((item) => <div key={item.label}><div className="text-[10px] uppercase tracking-[0.16em] text-[#817b6c]">{item.label}</div><div className="font-sans font-bold text-sm text-[#e8e0d3] mt-1 break-words">{item.value}</div></div>)}</div>
            </div>
          </div>

          <div className="px-5 sm:px-8 mt-6"><div className="border border-[#5d594d] rounded-xl p-4 flex gap-3 items-start"><Sparkles className="w-4 h-4 text-[#e98b5b] mt-0.5 shrink-0" /><p className="font-sans text-sm leading-relaxed text-[#e8e0d3]">{current.commentary}</p></div></div>

          <footer className="px-5 sm:px-8 py-5 mt-4 flex flex-wrap items-center gap-3 border-t border-[#39372f]"><button type="button" title="Reset" onClick={() => { setStep(0); setPlaying(false); }} className="p-2 border border-[#5d594d] rounded-lg hover:border-[#e98b5b]"><RotateCcw className="w-4 h-4" /></button><button type="button" title="Previous step" disabled={step === 0} onClick={() => { setPlaying(false); setStep((value) => Math.max(0, value - 1)); }} className="p-2 border border-[#5d594d] rounded-lg disabled:opacity-40 hover:border-[#e98b5b]"><ChevronLeft className="w-4 h-4" /></button><button type="button" onClick={() => setPlaying((value) => !value)} className="px-4 py-2 rounded-lg bg-[#f0e6d5] text-[#24211c] font-sans font-bold text-xs flex items-center gap-2 hover:bg-white">{playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {playing ? 'Pause' : 'Play'}</button><button type="button" title="Next step" disabled={step === frames.length - 1} onClick={() => { setPlaying(false); setStep((value) => Math.min(frames.length - 1, value + 1)); }} className="p-2 border border-[#5d594d] rounded-lg disabled:opacity-40 hover:border-[#e98b5b]"><ChevronRight className="w-4 h-4" /></button><input aria-label="Lesson progress" type="range" min="0" max={frames.length - 1} value={step} onChange={(event) => { setPlaying(false); setStep(Number(event.target.value)); }} className="flex-1 min-w-[120px] accent-[#e98b5b]" /><select aria-label="Playback speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="bg-[#1b1a16] border border-[#5d594d] rounded-lg px-2 py-2 text-xs"><option value="1800">0.5x</option><option value="1200">1x</option><option value="700">2x</option></select><span className="text-[10px] text-[#8b877a] w-10 text-right">{Math.round(progress)}%</span></footer>
        </section>

        {/* AI Chatbot Sidebar */}
        <aside className="hidden lg:block border-l border-[#4b483e]">
          <VisualizerChatbot currentFrame={current} problemTitle={problemTitle} step={step} />
        </aside>
      </div>
    </div>
  );
};
