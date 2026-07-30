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

const ink = '#f1ede5';
const muted = '#817b6c';
const line = '#575247';
const accent = '#e98b5b';
const accentSoft = '#493126';
const cyan = '#83c7c9';

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
      <rect x="0" y="0" width="680" height="300" rx="12" fill="#141311" />
      {children}
    </svg>
  );
}

function Label({ x, y, children, fill = muted, size = 12, anchor = 'middle' as const }: { x: number; y: number; children: React.ReactNode; fill?: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} textAnchor={anchor} fill={fill} fontSize={size} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{children}</text>;
}

function ArrayScene({ frame }: SceneProps) {
  const values = frame.values || [];
  // Max size is 76 to keep them nicely spaced. Cell box will be slightly smaller than cellWidth to have gaps.
  const cellWidth = Math.min(84, 560 / Math.max(values.length, 1));
  const boxSize = cellWidth - 12; // nice square box
  const total = cellWidth * values.length;
  const startX = (680 - total) / 2;
  const active = new Set(frame.active || []);
  const pointerEntries = Object.entries(frame.pointers || {});

  return (
    <SceneFrame>
      <g>
        {values.map((value, index) => {
          const x = startX + index * cellWidth + 6; // offset for gap
          const isActive = active.has(index);
          const yOffset = isActive ? 0 : 0; // If you want them to pop up, change to -4
          return (
            <motion.g key={`${value}-${index}`} animate={{ x: 0, y: yOffset }} transition={cellTransition} style={{ transformOrigin: `${x + boxSize / 2}px 145px` }}>
              {/* 3D Depth Shadow Layer */}
              <motion.rect x={x} y={100 + 4} width={boxSize} height={boxSize} rx="8" fill={isActive ? '#8c4c32' : 'transparent'} animate={{ fill: isActive ? '#8c4c32' : 'transparent' }} transition={cellTransition} />
              {/* Top Face */}
              <motion.rect x={x} y={100} width={boxSize} height={boxSize} rx="8" fill={isActive ? '#3e2821' : '#24211a'} stroke={isActive ? '#eb7c45' : '#ded1b6'} strokeWidth="2" animate={{ fill: isActive ? '#3e2821' : '#24211a', stroke: isActive ? '#eb7c45' : '#ded1b6' }} transition={cellTransition} />
              {/* Value Text */}
              <text x={x + boxSize / 2} y={100 + boxSize / 2 + 10} textAnchor="middle" fill={isActive ? '#ffffff' : '#f1ede5'} fontSize={28} fontWeight="900" fontFamily="sans-serif">{value}</text>
              {/* Index */}
              <Label x={x + boxSize / 2} y={100 + boxSize + 22} size={11}>[{index}]</Label>
            </motion.g>
          );
        })}
        {pointerEntries.map(([name, index], pointerIndex) => {
          const x = startX + index * cellWidth + cellWidth / 2;
          // Colors matching screenshot: first pointer (i) orange, second (j) blue
          const color = pointerIndex % 2 === 0 ? '#eb7c45' : '#6fa6d6';
          return (
            <motion.g key={name} animate={{ x }} transition={{ duration: 0.5, ease }}>
              {/* Pointer Letter */}
              <text x={0} y={230} textAnchor="middle" fill={color} fontSize={18} fontWeight="900" fontFamily="sans-serif">{name}</text>
              {/* Upward Triangle */}
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
              <motion.rect x={x + 3} y={y + 3 + 4} width={boxSize} height={boxSize} rx="6" fill={isActive ? '#8c4c32' : 'transparent'} animate={{ fill: isActive ? '#8c4c32' : 'transparent' }} transition={cellTransition} />
              <motion.rect x={x + 3} y={y + 3} width={boxSize} height={boxSize} rx="6" fill={isActive ? '#3e2821' : '#24211a'} stroke={isActive ? '#eb7c45' : '#ded1b6'} strokeWidth="2" animate={{ fill: isActive ? '#3e2821' : '#24211a', stroke: isActive ? '#eb7c45' : '#ded1b6' }} transition={cellTransition} />
              <text x={x + 3 + boxSize / 2} y={y + 3 + boxSize / 2 + 5} textAnchor="middle" fill={isActive ? '#ffffff' : '#f1ede5'} fontSize={size > 40 ? 18 : 14} fontWeight="900" fontFamily="sans-serif">{value}</text>
            </motion.g>
          );
        }))}
        <Label x={340} y={270} fill={muted} size={11}>{rows} x {cols} STATE MATRIX</Label>
      </g>
    </SceneFrame>
  );
}

function StackScene({ frame }: SceneProps) {
  const stack = frame.stack || [];
  return (
    <SceneFrame>
      <g>
        <motion.line x1="230" y1="248" x2="450" y2="248" stroke="#575247" strokeWidth="4" />
        {stack.map((value, index) => {
          const y = 226 - index * 48;
          const isActive = index === stack.length - 1;
          return (
            <motion.g key={`${value}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cellTransition, delay: index * 0.04 }}>
              <motion.rect x="270" y={y - 38 + 4} width="140" height="40" rx="8" fill={isActive ? '#8c4c32' : 'transparent'} layoutId={`stack-shadow-${index}`} />
              <motion.rect x="270" y={y - 38} width="140" height="40" rx="8" fill={isActive ? '#3e2821' : '#24211a'} stroke={isActive ? '#eb7c45' : '#ded1b6'} strokeWidth="2" layoutId={`stack-${index}`} />
              <text x={340} y={y - 12} textAnchor="middle" fill={isActive ? '#ffffff' : '#f1ede5'} fontSize={18} fontWeight="900" fontFamily="sans-serif">{value}</text>
            </motion.g>
          );
        })}
        <Label x={340} y={270} fill={muted} size={11}>STACK BOTTOM</Label>
        {stack.length > 0 && <Label x={340} y={48} fill={accent} size={11}>TOP</Label>}
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
        {nodes.slice(0, -1).map((_, index) => <motion.line key={`edge-${index}`} x1={startX + index * gap + 31} y1="150" x2={startX + (index + 1) * gap - 31} y2="150" stroke={active.has(index) ? accent : muted} strokeWidth="2" markerEnd={active.has(index) ? 'url(#scene-arrow-active)' : 'url(#scene-arrow)'} animate={{ stroke: active.has(index) ? accent : muted }} transition={cellTransition} />)}
        {nodes.map((node, index) => {
          const x = startX + index * gap;
          const isActive = active.has(index);
          return (
            <motion.g key={`${node}-${index}`} animate={{ x: 0, y: isActive ? -5 : 0, scale: isActive ? 1.06 : 1 }} transition={cellTransition} style={{ transformOrigin: `${x}px 150px` }}>
              <motion.circle cx={x} cy="150" r="31" fill={isActive ? accentSoft : '#25231e'} stroke={isActive ? accent : line} strokeWidth="2" animate={{ fill: isActive ? accentSoft : '#25231e', stroke: isActive ? accent : line }} transition={cellTransition} />
              <Label x={x} y={155} fill={isActive ? '#ffc199' : ink} size={node.length > 5 ? 10 : 14}>{node}</Label>
            </motion.g>
          );
        })}
        <Label x={340} y={250} fill={muted} size={11}>DIRECTIONAL NODE STATE</Label>
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
          return <motion.line key={`${from}-${to}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={edgeActive ? accent : line} strokeWidth={edgeActive ? 3 : 2} markerEnd={edgeActive ? 'url(#scene-arrow-active)' : 'url(#scene-arrow)'} animate={{ stroke: edgeActive ? accent : line }} transition={cellTransition} />;
        })}
        {nodes.map((node, index) => {
          const [x, y] = positions[index];
          const isActive = active.has(index);
          return <motion.g key={`${node}-${index}`} animate={{ scale: isActive ? 1.12 : 1 }} transition={cellTransition} style={{ transformOrigin: `${x}px ${y}px` }}><motion.circle cx={x} cy={y} r="32" fill={isActive ? accentSoft : '#25231e'} stroke={isActive ? accent : line} strokeWidth="2" animate={{ fill: isActive ? accentSoft : '#25231e', stroke: isActive ? accent : line }} transition={cellTransition} /><Label x={x} y={y + 5} fill={isActive ? '#ffc199' : ink} size={16}>{node}</Label></motion.g>;
        })}
        <Label x={340} y={275} fill={muted} size={11}>FRONTIER / VISITED GRAPH</Label>
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
        <line x1="80" y1="238" x2="600" y2="238" stroke={line} strokeWidth="2" />
        {bars.map((value, index) => {
          const height = (value / max) * 170;
          const x = startX + index * width + 4;
          const y = 238 - height;
          const isActive = active.has(index);
          return <motion.g key={`${value}-${index}`} animate={{ x: 0, y: 0 }} transition={cellTransition}><motion.rect x={x} y={y} width={width - 8} height={height} rx="5" fill={isActive ? accent : '#777163'} animate={{ y, height, fill: isActive ? accent : '#777163' }} transition={cellTransition} /><Label x={x + (width - 8) / 2} y={257} size={10}>{index}</Label></motion.g>;
        })}
        <Label x={340} y={285} fill={muted} size={11}>COMPARISON / PRIORITY BARS</Label>
      </g>
    </SceneFrame>
  );
}

function BitsScene({ frame }: SceneProps) {
  const bits = frame.bits || '';
  const size = Math.min(48, 500 / Math.max(bits.length, 1));
  const startX = 340 - (bits.length * size) / 2;
  return (
    <SceneFrame>
      <g>
        {bits.split('').map((bit, index) => {
          const x = startX + index * size;
          const isOne = bit === '1';
          return <motion.g key={`${index}-${bit}`} animate={{ y: isOne ? -5 : 0 }} transition={cellTransition}><motion.rect x={x + 3} y={115} width={size - 6} height={60} rx={8} fill={isOne ? accentSoft : '#22211d'} stroke={isOne ? accent : line} strokeWidth={2} animate={{ fill: isOne ? accentSoft : '#22211d', stroke: isOne ? accent : line }} transition={cellTransition} /><Label x={x + size / 2} y={153} fill={isOne ? '#ffc199' : muted} size={20}>{bit}</Label><Label x={x + size / 2} y={200} size={10}>{bits.length - index - 1}</Label></motion.g>;
        })}
        <Label x={340} y={250} fill={muted} size={11}>BIT POSITIONS</Label>
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
