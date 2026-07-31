'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Building2,
  Clock,
  Play,
  Send,
  Award,
  Bot,
  User,
  Loader2,
  Code2,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import CodeEditor from '@/components/editor/CodeEditor';
import { EvaluationReport } from '@/app/api/ai/mock-interview/route';
import { useToast } from '@/components/ui/Toast';

const COMPANIES = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Uber'];
const TOPICS = [
  'Arrays & Hashing',
  'Two Pointers & Sliding Window',
  'Dynamic Programming',
  'Trees & Graphs',
  'System Design & Microservices',
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function MockInterviewPage() {
  const { showToast } = useToast();
  const [stage, setStage] = useState<'setup' | 'interview'>('setup');
  const [selectedCompany, setSelectedCompany] = useState<string>('Google');
  const [selectedTopic, setSelectedTopic] = useState<string>('Arrays & Hashing');
  const [problemTitle, setProblemTitle] = useState<string>('DSA Coding Interview');
  const [problemId, setProblemId] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [code, setCode] = useState<string>(
    '// Write your candidate C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n'
  );
  const [language, setLanguage] = useState<string>('cpp');

  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const [evalReport, setEvalReport] = useState<EvaluationReport | null>(null);
  const [showEvalModal, setShowEvalModal] = useState<boolean>(false);

  // Timer: 45 Minutes (2700 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(2700);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => { if (interval !== null) clearInterval(interval); };
  }, [timerActive, timeLeft]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/ai/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          company: selectedCompany,
          topic: selectedTopic,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProblemId(data.problemId || '');
        setProblemTitle(data.problemTitle || `Technical Interview (${selectedCompany})`);
        setMessages([{ role: 'assistant', content: data.message }]);
        setStage('interview');
        setTimeLeft(2700);
        setTimerActive(true);
        showToast(`Matched with Senior Staff Interviewer for ${selectedCompany}!`, 'success');
      } else {
        showToast('Failed to initialize interview session', 'error');
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      showToast('Error connecting to interview service', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const sendCandidateMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          company: selectedCompany,
          topic: selectedTopic,
          problemId,
          problemTitle,
          messages: newMsgs,
          code,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const evaluateInterview = async () => {
    setIsEvaluating(true);
    setTimerActive(false);
    showToast('Generating AI Scorecard & Hiring Recommendation...', 'info');
    try {
      const res = await fetch('/api/ai/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          company: selectedCompany,
          topic: selectedTopic,
          problemId,
          problemTitle,
          messages,
          code,
        }),
      });

      if (res.ok) {
        const data: EvaluationReport = await res.json();
        setEvalReport(data);
        setShowEvalModal(true);
        showToast('Interview Scorecard Ready!', 'success');
      } else {
        showToast('Failed to evaluate interview', 'error');
      }
    } catch (err) {
      console.error('Error evaluating interview:', err);
      showToast('Error generating evaluation report', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
    >
      {/* SETUP STAGE */}
      {stage === 'setup' && (
        <div className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col justify-center space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Senior Engineer Interview Suite</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Simulate Live Tech Interviews with <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">FreeModel AI</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Practice real-world coding & system design interviews under time constraints. Get instant feedback on communication, algorithm choice, and final code quality.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl">
            {/* Company Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Target Tech Company</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COMPANIES.map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setSelectedCompany(comp)}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      selectedCompany === comp
                        ? 'bg-slate-800 border-cyan-500 text-cyan-400 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{comp}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>Interview Focus Topic</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TOPICS.map((top) => (
                  <button
                    key={top}
                    onClick={() => setSelectedTopic(top)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      selectedTopic === top
                        ? 'bg-slate-800 border-purple-500 text-purple-300 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{top}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              disabled={isStarting}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin fill-slate-950" />
                  <span>Matching with Staff Interviewer...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Start 45-Minute Live Interview Session</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* INTERVIEW STAGE */}
      {stage === 'interview' && (
        <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
          {/* Header Bar */}
          <header className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-400">
                {selectedCompany} Interview
              </span>
              <span className="text-xs text-slate-400 font-semibold">{selectedTopic}</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-mono text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Finish & Evaluate Button */}
            <button
              onClick={evaluateInterview}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 text-xs font-bold rounded-lg shadow transition disabled:opacity-50"
            >
              {isEvaluating ? (
                <Loader2 className="w-4 h-4 animate-spin fill-slate-950" />
              ) : (
                <Award className="w-4 h-4 fill-slate-950" />
              )}
              <span>End & Submit Scorecard</span>
            </button>
          </header>

          {/* Main Interview Body: 2 Columns */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            {/* Left Column: Live Chat with Staff Engineer (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col h-full border-r border-slate-800 bg-slate-900/30 overflow-hidden">
              <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Senior Staff Engineer Interviewer</span>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 h-fit shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.role === 'user' && (
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 h-fit shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-2 items-center text-slate-400 text-xs italic">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Interviewer is evaluating your response...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-slate-950 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendCandidateMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Speak to interviewer or explain logic..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className="p-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold rounded-xl shadow transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 fill-slate-950" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Code Workspace (7 Cols) */}
            <div className="lg:col-span-7 h-full flex flex-col p-3 bg-slate-950 overflow-hidden">
              <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Candidate Code Workspace</span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-2.5 py-1 text-xs"
                  >
                    <option value="python">Python 3</option>
                    <option value="cpp">C++</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                  </select>
                </div>

                <div className="flex-1">
                  <CodeEditor
                    language={language}
                    value={code}
                    onChange={(val) => setCode(val)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION SCORECARD MODAL */}
      {showEvalModal && evalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Interview Evaluation Scorecard
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedCompany} Senior Software Engineer Track
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEvalModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Score & Verdict Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-4">
                  <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                    {evalReport.score}/100
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">
                      Overall Score
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      Technical Rating
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">
                      Hiring Verdict
                    </div>
                    <div className="text-sm font-extrabold text-emerald-400">
                      {evalReport.verdict}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">
                    Skill Breakdown
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Problem Solving: <span className="text-cyan-400">{evalReport.problemSolvingScore}%</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Code Quality: <span className="text-purple-400">{evalReport.codeQualityScore}%</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Executive Summary
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evalReport.summary}
                </p>
              </div>

              {/* Technical Communication */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Technical Communication & Thought Process
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evalReport.technicalCommunication}
                </p>
              </div>

              {/* Strengths & Areas to Improve */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase">Key Strengths</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evalReport.keyStrengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase">Areas to Improve</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evalReport.areasToImprove.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setStage('setup')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition"
              >
                Start New Interview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
