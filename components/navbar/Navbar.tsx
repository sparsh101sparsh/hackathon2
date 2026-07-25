'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getRatingTier } from '@/lib/rating';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  LogIn,
  Sparkles,
  LayoutDashboard,
  Trophy,
  Building2,
  Bot,
  BarChart2,
  Menu,
  X,
  ChevronDown,
  Code,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, role, openAuthModal, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide main navbar inside problem detail view if it uses full screen workspace layout
  if (pathname.startsWith('/problems/') && pathname !== '/problems') {
    return null;
  }

  const userRating = user?.rating ?? 1500;
  const ratingTier = getRatingTier(userRating);

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

      {/* Right User Profile Dropdown & Controls */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <div className="relative">
            {/* User Badge Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                <span className={`text-[10px] font-semibold ${ratingTier.badgeText}`}>
                  {ratingTier.badge} [{userRating}]
                </span>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Popup */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 p-2 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-1 z-50"
                >
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300">
                      <span>Rating: {userRating} Elo</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    <span>My Dashboard</span>
                  </Link>

                  {role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-bold text-purple-300 hover:bg-purple-950/60 flex items-center gap-2 transition border border-purple-900/40"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-md shadow-cyan-950/50 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Hamburger Button */}
      <div className="flex xl:hidden items-center gap-2">
        {user && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${ratingTier.badgeBg} ${ratingTier.badgeText}`}>
            {ratingTier.badge} [{userRating}]
          </span>
        )}
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

              {role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-purple-400 bg-purple-950/40 border border-purple-900/60 flex items-center gap-3"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user.name}</div>
                      <div className={`text-xs font-semibold ${ratingTier.badgeText}`}>
                        {ratingTier.badge} [{userRating}]
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
