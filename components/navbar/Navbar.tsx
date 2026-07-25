'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  LayoutDashboard,
  Trophy,
  Building2,
  Bot,
  BarChart2,
  Menu,
  X,
  Code,
  Github,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide main navbar inside problem detail view if it uses full screen workspace layout
  if (pathname.startsWith('/problems/') && pathname !== '/problems') {
    return null;
  }

  const navLinks = [
    { label: 'Problems', href: '/problems', icon: <Code className="w-4 h-4" /> },
    { label: 'Contests', href: '/contests', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Company Prep', href: '/company', icon: <Building2 className="w-4 h-4" /> },
    { label: 'AI Mock Interview', href: '/mock-interview', icon: <Bot className="w-4 h-4 text-cyan-400" /> },
    { label: 'Leaderboard', href: '/leaderboard', icon: <BarChart2 className="w-4 h-4" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <nav className="backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60 sticky top-0 z-50 px-4 sm:px-6 h-16 flex items-center justify-between font-sans">
      {/* Left Brand Emblem & Nav Links */}
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Glowing Logo Emblem */}
        <Link href="/" className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition duration-200">
            <Code2 className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <span className="text-lg font-black tracking-tight">
            CodeForge <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">AI</span>
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
                    ? 'bg-slate-800/90 text-cyan-400 border border-slate-700/80 shadow-sm'
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

      {/* Right Controls: GitHub Repo Link */}
      <div className="hidden md:flex items-center gap-3">
        <a
          href="https://github.com/sparsh101sparsh/hackathon2"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition flex items-center gap-2 shadow-sm"
        >
          <Github className="w-4 h-4 text-cyan-400" />
          <span>GitHub Repo</span>
        </a>
      </div>

      {/* Mobile Drawer Hamburger Button */}
      <div className="flex xl:hidden items-center gap-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 w-full bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl px-6 py-6 space-y-4 xl:hidden z-50 shadow-2xl"
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
                        ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href="https://github.com/sparsh101sparsh/hackathon2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition"
              >
                <Github className="w-4 h-4 text-cyan-400" />
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
