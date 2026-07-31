'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  Code2,
  Trophy,
  Building2,
  Bot,
  BarChart2,
  Menu,
  X,
  Code,
  Github,
  LogIn,
  UserPlus,
  LogOut,
  Brain,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Hide main navbar inside problem detail view if it uses full screen workspace layout
  if (pathname.startsWith('/problems/') && pathname !== '/problems') {
    return null;
  }

  const navLinks = [
    { label: 'Problems', href: '/problems', icon: <Code className="w-4 h-4" /> },
    { label: 'Contests', href: '/contests', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Revision Deck', href: '/revision', icon: <Brain className="w-4 h-4 text-amber-400" /> },
    { label: 'Company Prep', href: '/company', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Mock Interview', href: '/mock-interview', icon: <Bot className="w-4 h-4 text-amber-400" /> },
    { label: 'Leaderboard', href: '/leaderboard', icon: <BarChart2 className="w-4 h-4" /> },
    { label: 'Visualizer', href: '/visualizer', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <nav className="bg-[#08080a]/95 border-b border-white/10 sticky top-0 z-50 px-4 sm:px-6 h-16 flex items-center justify-between font-sans">
      {/* Left Brand Emblem & Nav Links */}
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Glowing Logo Emblem */}
        <Link href="/" className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight group">
          <div className="p-2 rounded-lg bg-amber-400 text-[#08080a] shadow-lg shadow-amber-400/10 group-hover:scale-105 group-hover:shadow-amber-400/20 transition duration-200">
            <Code2 className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <span className="text-lg font-black tracking-tight">
            CodeForge
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#17171b] text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right Controls: Auth Buttons / User Profile */}
      <div className="hidden md:flex items-center gap-3">
        <a
          href="https://github.com/sparsh101sparsh/hackathon2"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-[#111115] hover:bg-[#17171b] text-slate-200 border border-white/10 font-semibold text-xs transition-all flex items-center gap-1.5"
        >
          <Github className="w-4 h-4 text-amber-300" />
          <span>GitHub</span>
        </a>

        {user ? (
          <div className="flex items-center gap-3 bg-[#0f0f12] border border-white/10 rounded-lg p-1 pr-3 shadow-inner hover:border-amber-400/40 transition">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group cursor-pointer"
              title="View User Dashboard"
            >
              <Image
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                width={28}
                height={28}
                unoptimized
                className="w-7 h-7 rounded-lg border border-white/10 bg-[#08080a] shrink-0 group-hover:border-amber-400 transition"
              />
              <div className="text-left leading-none">
                <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition">{user.name}</div>
                <div className="text-[10px] text-slate-400">{user.email}</div>
              </div>
            </Link>
            <button
              onClick={() => logout()}
              title="Sign Out"
              aria-label="Sign out"
              className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-[#111115] hover:bg-[#17171b] text-slate-200 border border-white/10 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#08080a] font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/10 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-950" />
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Drawer Hamburger Button */}
      <div className="flex xl:hidden items-center gap-2">
        <button
          ref={menuButtonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          type="button"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-navigation-menu"
            role="region"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 w-full bg-[#0a0a0d] border-b border-white/10 px-6 py-6 space-y-4 xl:hidden z-50 shadow-2xl"
          >
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition ${
                      isActive
                        ? 'bg-[#17171b] text-amber-300 border border-amber-400/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 group"
                  >
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      width={32}
                      height={32}
                      unoptimized
                      className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 group-hover:border-amber-400 transition"
                    />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    type="button"
                    aria-label="Sign out"
                    className="p-2 rounded-lg text-rose-400 hover:bg-slate-800 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 rounded-lg text-xs font-bold bg-[#111115] border border-white/10 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition"
                  >
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#08080a] flex items-center justify-center gap-2 transition font-bold"
                  >
                    <UserPlus className="w-4 h-4 text-slate-950" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}

              <a
                href="https://github.com/sparsh101sparsh/hackathon2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#111115] border border-white/10 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition"
              >
                <Github className="w-4 h-4 text-amber-300" />
                <span>GitHub Repo</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
