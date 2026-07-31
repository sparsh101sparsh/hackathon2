'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface VisualizerSceneFrame {
  visualType: 'array' | 'matrix' | 'stack' | 'nodes' | 'graph' | 'bars' | 'bits';
  values?: (string | number)[];
  matrix?: (string | number)[][];
  stack?: (string | number)[];
  nodes?: string[];
  edges?: [number, number][];
  active?: number[];
  pointers?: Record<string, number>;
  bars?: number[];
  bits?: string;
}

type SceneProps = {
  frame: VisualizerSceneFrame;
  step: number;
};

export const SCENE_THEME = {
  active: {
    fill: '#92400e',
    fillGradient: '#b45309',
    stroke: '#fbbf24',
    shadow: 'rgba(251, 191, 36, 0.2)',
    text: '#fcd34d',
  },
  visited: {
    fill: '#57534e',
    fillGradient: '#78716c',
    stroke: '#d6d3d1',
    shadow: 'rgba(214, 211, 209, 0.16)',
    text: '#e7e5e4',
  },
  default: {
    fill: '#111115',
    stroke: '#3f3f46',
    text: '#f8fafc',
  },
  text: {
    slate100: '#f8fafc',
    cyan300: '#fcd34d',
    emerald300: '#d6d3d1',
    muted: '#a8a29e',
  },
  background: '#08080a',
} as const;

const ink = SCENE_THEME.text.slate100;
const muted = SCENE_THEME.text.muted;
const line = SCENE_THEME.default.stroke;
const accent = SCENE_THEME.active.stroke;
const accentSoft = SCENE_THEME.active.fillGradient;
const cyan = SCENE_THEME.visited.stroke;

const ease = [0.22, 1, 0.36, 1] as const;
const cellTransition = { duration: 0.42, ease };

function SceneFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 680 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animated algorithm state" className="w-full h-[300px] overflow-visible">
      <defs>
        <marker id="scene-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill={muted} />
        </marker>
        <marker id="scene-arrow-active" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill={accent} />
        </marker>
      </defs>
      <rect x="0" y="0" width="680" height="300" rx="12" fill={SCENE_THEME.background} />
      {children}
    </svg>
  );
}

function Label({ x, y, children, fill = muted, size = 12, anchor = 'middle' as const }: { x: number; y: number; children: React.ReactNode; fill?: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} textAnchor={anchor} fill={fill} fontSize={size} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{children}</text>;
}

function ArrayScene({ frame }: SceneProps) {
  const values = frame.values || [];
  const cellWidth = Math.min(84, 560 / Math.max(values.length, 1));
  const boxSize = cellWidth - 12;
  const total = cellWidth * values.length;
  const startX = (680 - total) / 2;
  const active = new Set(frame.active || []);
  const pointerEntries = Object.entries(frame.pointers || {});

  return (
    <SceneFrame>
      <g>
        {values.map((value, index) => {
          const x = startX + index * cellWidth + 6;
          const isActive = active.has(index);
          const yOffset = 0;
          return (
            <motion.g key={`${value}-${index}`} animate={{ x: 0, y: yOffset }} transition={cellTransition} style={{ transformOrigin: `${x + boxSize / 2}px 145px` }}>
              <motion.rect x={x} y={100 + 4} width={boxSize} height={boxSize} rx="8" fill={isActive ? SCENE_THEME.active.fill : 'transparent'} animate={{ fill: isActive ? SCENE_THEME.active.fill : 'transparent' }} transition={cellTransition} />
              <motion.rect x={x} y={100} width={boxSize} height={boxSize} rx="8" fill={isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill} stroke={isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="2" animate={{ fill: isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill, stroke: isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />
              <text x={x + boxSize / 2} y={100 + boxSize / 2 + 10} textAnchor="middle" fill={isActive ? SCENE_THEME.text.cyan300 : SCENE_THEME.text.slate100} fontSize={28} fontWeight="900" fontFamily="sans-serif">{value}</text>
              <Label x={x + boxSize / 2} y={100 + boxSize + 22} size={11}>[{index}]</Label>
            </motion.g>
          );
        })}
        {pointerEntries.map(([name, index], pointerIndex) => {
          const x = startX + index * cellWidth + cellWidth / 2;
          const color = pointerIndex % 2 === 0 ? SCENE_THEME.active.stroke : SCENE_THEME.visited.stroke;
          return (
            <motion.g key={name} animate={{ x }} transition={{ duration: 0.5, ease }}>
              <text x={0} y={230} textAnchor="middle" fill={color} fontSize={18} fontWeight="900" fontFamily="sans-serif">{name}</text>
              <path d="M -4 245 L 4 245 L 0 237 Z" fill={color} />
            </motion.g>
          );
        })}
      </g>
    </SceneFrame>
  );
}

function MatrixScene({ frame }: SceneProps) {
  const matrix = frame.matrix || [[]];
  const rows = matrix.length;
  const cols = Math.max(...matrix.map((row) => row.length), 1);
  const size = Math.min(52, 210 / Math.max(rows, cols));
  const left = 340 - (cols * size) / 2;
  const top = 150 - (rows * size) / 2;
  const active = new Set(frame.active || []);
  return (
    <SceneFrame>
      <g>
        {matrix.flatMap((row, rowIndex) => row.map((value, colIndex) => {
          const index = rowIndex * cols + colIndex;
          const x = left + colIndex * size;
          const y = top + rowIndex * size;
          const isActive = active.has(index);
          const boxSize = size - 6;
          return (
            <motion.g key={`${rowIndex}-${colIndex}`} animate={{ x: 0, y: 0 }} transition={cellTransition}>
              <motion.rect x={x + 3} y={y + 3 + 4} width={boxSize} height={boxSize} rx="6" fill={isActive ? SCENE_THEME.active.fill : 'transparent'} animate={{ fill: isActive ? SCENE_THEME.active.fill : 'transparent' }} transition={cellTransition} />
              <motion.rect x={x + 3} y={y + 3} width={boxSize} height={boxSize} rx="6" fill={isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill} stroke={isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="2" animate={{ fill: isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill, stroke: isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />
              <text x={x + 3 + boxSize / 2} y={y + 3 + boxSize / 2 + 5} textAnchor="middle" fill={isActive ? SCENE_THEME.text.cyan300 : SCENE_THEME.text.slate100} fontSize={size > 40 ? 18 : 14} fontWeight="900" fontFamily="sans-serif">{value}</text>
            </motion.g>
          );
        }))}
        <Label x={340} y={270} fill={SCENE_THEME.text.muted} size={11}>{rows} x {cols} STATE MATRIX</Label>
      </g>
    </SceneFrame>
  );
}

function StackScene({ frame }: SceneProps) {
  const stack = frame.stack || [];
  return (
    <SceneFrame>
      <g>
        <motion.line x1="230" y1="248" x2="450" y2="248" stroke={SCENE_THEME.default.stroke} strokeWidth="4" />
        {stack.map((value, index) => {
          const y = 226 - index * 48;
          const isActive = index === stack.length - 1;
          return (
            <motion.g key={`${value}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cellTransition, delay: index * 0.04 }}>
              <motion.rect x="270" y={y - 38 + 4} width="140" height="40" rx="8" fill={isActive ? SCENE_THEME.active.fill : 'transparent'} layoutId={`stack-shadow-${index}`} />
              <motion.rect x="270" y={y - 38} width="140" height="40" rx="8" fill={isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill} stroke={isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="2" layoutId={`stack-${index}`} />
              <text x={340} y={y - 12} textAnchor="middle" fill={isActive ? SCENE_THEME.text.cyan300 : SCENE_THEME.text.slate100} fontSize={18} fontWeight="900" fontFamily="sans-serif">{value}</text>
            </motion.g>
          );
        })}
        <Label x={340} y={270} fill={SCENE_THEME.text.muted} size={11}>STACK BOTTOM</Label>
        {stack.length > 0 && <Label x={340} y={48} fill={SCENE_THEME.active.stroke} size={11}>TOP</Label>}
      </g>
    </SceneFrame>
  );
}

function NodeScene({ frame }: SceneProps) {
  const nodes = frame.nodes || [];
  const active = new Set(frame.active || []);
  const gap = Math.min(104, 560 / Math.max(nodes.length, 1));
  const startX = 340 - ((nodes.length - 1) * gap) / 2;
  return (
    <SceneFrame>
      <g>
        {nodes.slice(0, -1).map((_, index) => <motion.line key={`edge-${index}`} x1={startX + index * gap + 31} y1="150" x2={startX + (index + 1) * gap - 31} y2="150" stroke={active.has(index) ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="4" markerEnd={active.has(index) ? 'url(#scene-arrow-active)' : 'url(#scene-arrow)'} animate={{ stroke: active.has(index) ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />)}
        {nodes.map((node, index) => {
          const x = startX + index * gap;
          const isActive = active.has(index);
          return (
            <motion.g key={`${node}-${index}`} animate={{ x: 0, y: 0 }} transition={cellTransition}>
              <motion.circle cx={x} cy={150 + 4} r="31" fill={isActive ? SCENE_THEME.active.fill : 'transparent'} transition={cellTransition} />
              <motion.circle cx={x} cy={150} r="31" fill={isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill} stroke={isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="2" animate={{ fill: isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill, stroke: isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />
              <text x={x} y={150 + 5} textAnchor="middle" fill={isActive ? SCENE_THEME.text.cyan300 : SCENE_THEME.text.slate100} fontSize={node.length > 5 ? 12 : 18} fontWeight="900" fontFamily="sans-serif">{node}</text>
            </motion.g>
          );
        })}
      </g>
    </SceneFrame>
  );
}

function GraphScene({ frame }: SceneProps) {
  const nodes = frame.nodes || [];
  const active = new Set(frame.active || []);
  const positions = nodes.map((_, index) => [[150, 150], [310, 78], [310, 222], [510, 78], [510, 222]][index] || [340, 150]);
  return (
    <SceneFrame>
      <g>
        {(frame.edges || []).map(([from, to], index) => {
          const [x1, y1] = positions[from] || positions[0];
          const [x2, y2] = positions[to] || positions[0];
          const edgeActive = active.has(from) && (active.has(to) || index < active.size);
          return <motion.line key={`${from}-${to}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={edgeActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth={edgeActive ? 4 : 3} markerEnd={edgeActive ? 'url(#scene-arrow-active)' : 'url(#scene-arrow)'} animate={{ stroke: edgeActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />;
        })}
        {nodes.map((node, index) => {
          const [x, y] = positions[index];
          const isActive = active.has(index);
          return (
            <motion.g key={`${node}-${index}`} animate={{ x: 0, y: 0 }} transition={cellTransition}>
              <motion.circle cx={x} cy={y + 4} r="32" fill={isActive ? SCENE_THEME.active.fill : 'transparent'} transition={cellTransition} />
              <motion.circle cx={x} cy={y} r="32" fill={isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill} stroke={isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="2" animate={{ fill: isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill, stroke: isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />
              <text x={x} y={y + 6} textAnchor="middle" fill={isActive ? SCENE_THEME.text.cyan300 : SCENE_THEME.text.slate100} fontSize={18} fontWeight="900" fontFamily="sans-serif">{node}</text>
            </motion.g>
          );
        })}
      </g>
    </SceneFrame>
  );
}

function BarsScene({ frame }: SceneProps) {
  const bars = frame.bars || [];
  const active = new Set(frame.active || []);
  const width = Math.min(54, 500 / Math.max(bars.length, 1));
  const startX = 340 - (bars.length * width) / 2;
  const max = Math.max(...bars, 1);
  return (
    <SceneFrame>
      <g>
        <line x1="80" y1="238" x2="600" y2="238" stroke={SCENE_THEME.default.stroke} strokeWidth="4" />
        {bars.map((value, index) => {
          const height = Math.max((value / max) * 170, 10);
          const x = startX + index * width + 4;
          const y = 238 - height;
          const isActive = active.has(index);
          const boxWidth = width - 8;
          return (
            <motion.g key={`${value}-${index}`} animate={{ x: 0, y: 0 }} transition={cellTransition}>
              <motion.rect x={x + 3} y={y + 3} width={boxWidth} height={height} rx="4" fill={isActive ? SCENE_THEME.active.fill : 'transparent'} animate={{ y: y + 3, height: height }} transition={cellTransition} />
              <motion.rect x={x} y={y} width={boxWidth} height={height} rx="4" fill={isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill} stroke={isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="2" animate={{ y, height, fill: isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill, stroke: isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />
              <text x={x + boxWidth / 2} y={257} textAnchor="middle" fill={isActive ? SCENE_THEME.text.cyan300 : SCENE_THEME.text.slate100} fontSize={12} fontWeight="900" fontFamily="sans-serif">{index}</text>
            </motion.g>
          );
        })}
      </g>
    </SceneFrame>
  );
}

function BitsScene({ frame }: SceneProps) {
  const bits = frame.bits || '';
  const cellWidth = Math.min(64, 560 / Math.max(bits.length, 1));
  const boxSize = cellWidth - 8;
  const total = cellWidth * bits.length;
  const startX = (680 - total) / 2;
  const active = new Set(frame.active || []);

  return (
    <SceneFrame>
      <g>
        {bits.split('').map((bit, index) => {
          const x = startX + index * cellWidth + 4;
          const isActive = bit === '1' || active.has(index);
          return (
            <motion.g key={`${index}-${bit}`} animate={{ x: 0, y: 0 }} transition={cellTransition} style={{ transformOrigin: `${x + boxSize / 2}px 145px` }}>
              <motion.rect x={x} y={100 + 4} width={boxSize} height={boxSize} rx="8" fill={isActive ? SCENE_THEME.active.fill : 'transparent'} animate={{ fill: isActive ? SCENE_THEME.active.fill : 'transparent' }} transition={cellTransition} />
              <motion.rect x={x} y={100} width={boxSize} height={boxSize} rx="8" fill={isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill} stroke={isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke} strokeWidth="2" animate={{ fill: isActive ? SCENE_THEME.active.fillGradient : SCENE_THEME.default.fill, stroke: isActive ? SCENE_THEME.active.stroke : SCENE_THEME.default.stroke }} transition={cellTransition} />
              <text x={x + boxSize / 2} y={100 + boxSize / 2 + 10} textAnchor="middle" fill={isActive ? SCENE_THEME.text.cyan300 : SCENE_THEME.text.slate100} fontSize={24} fontWeight="900" fontFamily="sans-serif">{bit}</text>
              <Label x={x + boxSize / 2} y={100 + boxSize + 22} size={11}>{bits.length - index - 1}</Label>
            </motion.g>
          );
        })}
      </g>
    </SceneFrame>
  );
}

export function VisualizerScene({ frame, step }: SceneProps) {
  const key = `${frame.visualType}-${step}`;
  return (
    <motion.div key={key} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24 }} className="w-full">
      {frame.visualType === 'array' && <ArrayScene frame={frame} step={step} />}
      {frame.visualType === 'matrix' && <MatrixScene frame={frame} step={step} />}
      {frame.visualType === 'stack' && <StackScene frame={frame} step={step} />}
      {frame.visualType === 'nodes' && <NodeScene frame={frame} step={step} />}
      {frame.visualType === 'graph' && <GraphScene frame={frame} step={step} />}
      {frame.visualType === 'bars' && <BarsScene frame={frame} step={step} />}
      {frame.visualType === 'bits' && <BitsScene frame={frame} step={step} />}
    </motion.div>
  );
}
