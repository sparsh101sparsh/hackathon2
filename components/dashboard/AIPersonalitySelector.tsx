'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { useAIPersonality } from '@/hooks/useAIPersonality';
import { AIPersonality, AIPersonalityId } from '@/lib/aiPersonalities';

interface PersonalityCardProps {
  personality: AIPersonality;
  isSelected: boolean;
  onSelect: (id: AIPersonalityId) => void;
}

function PersonalityCard({ personality, isSelected, onSelect }: PersonalityCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(personality.id)}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative w-full text-left rounded-xl border p-4 transition-all duration-300 cursor-pointer
        ${isSelected
          ? `bg-gradient-to-br ${personality.color} ${personality.borderColor} shadow-lg ${personality.glowColor}`
          : 'bg-slate-900/60 border-slate-800/60 hover:border-slate-600/60 hover:bg-slate-800/40'
        }
      `}
    >
      {/* Selected badge */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar / Emoji */}
        <div className={`
          text-2xl w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0
          ${isSelected ? 'bg-white/10' : 'bg-slate-800/80'}
        `}>
          {personality.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
              {personality.name}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              isSelected ? 'bg-white/15 text-white/80' : 'bg-slate-800 text-slate-400'
            }`}>
              {personality.title}
            </span>
          </div>
          <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
            {personality.shortDesc}
          </p>
          <p className={`text-[10px] mt-1 italic ${isSelected ? 'text-white/50' : 'text-slate-600'}`}>
            {personality.tagline}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export function AIPersonalitySelector() {
  const { personality, personalityId, setPersonality, allPersonalities, isLoaded } = useAIPersonality();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isLoaded) {
    return (
      <div className="w-full bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-3" />
        <div className="h-14 bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">AI Personality</h2>
          <p className="text-[11px] text-slate-500">Shapes how your AI tutor, hints, and reviews speak to you</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5">
            {personality.emoji} {personality.name}
          </span>
        </div>
      </div>

      {/* Currently selected — compact preview */}
      <motion.button
        onClick={() => setIsExpanded((prev) => !prev)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-300
          bg-gradient-to-r ${personality.color} ${personality.borderColor} shadow-md
        `}
      >
        <div className="text-2xl w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          {personality.emoji}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{personality.name}</span>
            <span className="text-[10px] bg-white/15 text-white/80 rounded-full px-1.5 py-0.5">{personality.title}</span>
            <span className="text-[10px] text-white/40 ml-auto">{personality.era}</span>
          </div>
          <p className="text-[11px] text-white/60 mt-0.5">{personality.shortDesc}</p>
        </div>
        <div className="flex-shrink-0">
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-white/50" />
            : <ChevronDown className="w-4 h-4 text-white/50" />
          }
        </div>
      </motion.button>

      {/* Personality Grid — expandable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-1.5">
              {/* Info banner */}
              <div className="flex items-center gap-2 bg-violet-950/40 border border-violet-800/30 rounded-lg px-3 py-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                <p className="text-[11px] text-violet-300">
                  Your AI tutor, hints, code reviews, mock interviews, and recommendations will all speak in this personality's unique voice.
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allPersonalities.map((p) => (
                  <PersonalityCard
                    key={p.id}
                    personality={p}
                    isSelected={p.id === personalityId}
                    onSelect={(id) => {
                      setPersonality(id);
                      setIsExpanded(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
