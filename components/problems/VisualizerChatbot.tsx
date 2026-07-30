'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react';
import { getPersonality, PERSONALITY_STORAGE_KEY } from '@/lib/aiPersonalities';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VisualizerChatbotProps {
  currentFrame: any;
  problemTitle: string;
  step: number;
}

export function VisualizerChatbot({ currentFrame, problemTitle, step }: VisualizerChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personality = getPersonality(
    typeof window !== 'undefined' ? localStorage.getItem(PERSONALITY_STORAGE_KEY) : null
  );

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `${personality.emoji} Hi! I'm your visualizer guide, ${personality.name}. I can explain the algorithms step-by-step. Let me know if you have any questions about the current state!`,
        },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentFrame?.commentary]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle,
          currentFrame,
          step,
          messages: newMessages,
          personality: personality.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Oops, I encountered an error analyzing the visualizer state. Try again!' },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#11110f] border-l border-[#4b483e]">
      <div className="px-4 py-3 border-b border-[#4b483e] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#e98b5b]/10 flex items-center justify-center text-lg shrink-0 border border-[#e98b5b]/20">
          {personality.emoji}
        </div>
        <div>
          <div className="text-sm font-bold text-[#f7f3ea]">{personality.name} Guide</div>
          <div className="text-[10px] text-[#e98b5b] flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Visualizer AI
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {currentFrame?.commentary && (
          <div className="flex gap-3 items-start opacity-70 border-b border-[#39372f] pb-4 mb-4">
            <div className="w-6 h-6 rounded bg-[#2a2720] flex items-center justify-center text-[10px] shrink-0 border border-[#4b483e]">
              {step + 1}
            </div>
            <div className="text-xs text-[#d0cabd] leading-relaxed">
              <span className="text-[#817b6c] uppercase text-[10px] block mb-1">Current Step Context</span>
              {currentFrame.commentary}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#39372f] text-[#d0cabd]'
                  : 'bg-[#e98b5b]/10 text-[#e98b5b] border border-[#e98b5b]/20'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : personality.emoji}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#39372f] text-[#f7f3ea] rounded-tr-none'
                  : 'bg-[#1b1a17] text-[#d0cabd] border border-[#39372f] rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#e98b5b]/10 flex items-center justify-center shrink-0 border border-[#e98b5b]/20">
              <Loader2 className="w-4 h-4 text-[#e98b5b] animate-spin" />
            </div>
            <div className="bg-[#1b1a17] border border-[#39372f] rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#817b6c] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#817b6c] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#817b6c] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[#4b483e] bg-[#11110f]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder="Ask about this step..."
            className="w-full bg-[#1b1a17] border border-[#4b483e] rounded-full pl-4 pr-10 py-2.5 text-xs text-[#f7f3ea] placeholder-[#817b6c] focus:outline-none focus:border-[#e98b5b] transition"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-1.5 rounded-full bg-[#e98b5b] text-[#241812] disabled:opacity-50 disabled:bg-[#4b483e] disabled:text-[#817b6c] transition hover:bg-white"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
