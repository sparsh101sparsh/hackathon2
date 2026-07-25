'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Loader2, MessageSquare, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatTutorDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  problemTitle: string;
  problemStatement?: string;
  userCode: string;
  language: string;
}

const QUICK_PROMPTS = [
  'Explain this error or issue',
  'How to optimize time complexity?',
  'What edge cases am I missing?',
  'Give me a hint without giving solution',
];

export const AIChatTutorDrawer: React.FC<AIChatTutorDrawerProps> = ({
  isOpen,
  onToggle,
  problemTitle,
  problemStatement = '',
  userCode,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your Socratic DSA Tutor. How can I help you tackle "${problemTitle}" today? Feel free to ask about algorithms, edge cases, or optimizations!`,
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle,
          problemStatement,
          userCode,
          language,
          messages: newMessages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "Sorry, I had trouble reaching the AI tutor server. Please try asking again!",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Network error connecting to AI Tutor. Please check your connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button when Drawer is Closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-full shadow-2xl transition-all transform hover:scale-105"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span className="text-xs tracking-wide font-sans">AI Socratic Tutor</span>
        </button>
      )}

      {/* Drawer Overlay Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 top-0 z-50 w-full sm:w-[420px] bg-slate-950/95 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-xl font-sans">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  AI DSA Socratic Tutor
                  <span className="px-2 py-0.2 text-[9px] uppercase font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    gpt-5.4-mini
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Guiding step-by-step problem solving</p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700/80 transition flex items-center gap-1 shrink-0"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 h-fit shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line shadow'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 h-fit shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-slate-400 text-xs">
                <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Thinking & analyzing code logic...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI DSA tutor a question..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold rounded-xl shadow transition disabled:opacity-50"
              >
                <Send className="w-4 h-4 fill-slate-950" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatTutorDrawer;
