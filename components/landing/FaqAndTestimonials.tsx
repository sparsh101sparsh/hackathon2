'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Star, Quote, HelpCircle, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How does CodeForge AI execute user code safely?',
    answer: 'CodeForge AI routes code execution requests to Piston API, an isolated containerized engine supporting C++, Python, JavaScript, Java, and Go. Each execution runs with strict memory caps, execution time limits, and security restrictions.',
  },
  {
    question: 'Is the AI Assistant free or do I need an API key?',
    answer: 'The AI Assistant operates using FreeModel AI (Gemini integration), providing instant automated code reviews, progressive 3-level hints, and mock interview feedback out of the box without requiring personal API tokens.',
  },
  {
    question: 'How are contest ratings calculated?',
    answer: 'Contest ratings follow a Codeforces-style Elo update algorithm. Performance is calculated based on user rank vs expected rank, total score, and time penalty. Ratings range from Bronze (800) up to Grandmaster (2400+).',
  },
  {
    question: 'Can I practice company-specific interview questions?',
    answer: 'Yes! The Company Prep module curates top DSA problems asked by tech leaders like Google, Meta, Amazon, Apple, and Netflix, complete with frequency breakdown and company tags.',
  },
  {
    question: 'How do progressive hints work during problem solving?',
    answer: 'Hints are divided into three levels: 1) High-Level Concept, 2) Algorithmic Pattern, and 3) Pseudocode Walkthrough. You can unlock them step-by-step so you get assistance without spoiling the solution.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Senior Software Engineer @ Google',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content: 'CodeForge AI cut my interview preparation time in half. The 3-level progressive hints allowed me to unblock myself without reading full editorials.',
    rating: 5,
  },
  {
    name: 'Alex Rivera',
    role: 'Staff Infrastructure Lead @ Meta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'The Piston code execution engine is lightning fast, and the AI code review modal gives feedback as detailed as a senior engineering peer review.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'SDE-2 @ Amazon',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    content: 'The Codeforces-style rated contests and Recharts topic radar chart keep me accountable every week. Highly recommended for any engineer!',
    rating: 5,
  },
];

export const FaqAndTestimonials: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto space-y-20">
      {/* Testimonials / Social Proof Section */}
      <div className="space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-300 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Loved by Engineers at Top Tech Companies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Developer Testimonials & Social Proof
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            See how candidate engineers and competitive coders use CodeForge AI to level up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col justify-between shadow-xl relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-800 pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-6 flex items-center gap-3 border-t border-slate-800/80 mt-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full border border-cyan-500/40 object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    <span>{t.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-[11px] text-slate-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about CodeForge AI platform execution, hints, and contests.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-400 border-t border-slate-800/60 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
