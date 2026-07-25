'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { MonacoPreviewDemo } from '@/components/landing/MonacoPreviewDemo';
import { CoreFeaturesGrid } from '@/components/landing/CoreFeaturesGrid';
import { FaqAndTestimonials } from '@/components/landing/FaqAndTestimonials';

export default function Home() {
  return (
    <div
      className="min-h-screen text-slate-100 overflow-x-hidden relative"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(6,182,212,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139,92,246,0.08) 0%, transparent 60%), #020817',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Interactive Monaco Preview & AI Review Demo */}
      <MonacoPreviewDemo />

      {/* 3. Core Features Grid */}
      <CoreFeaturesGrid />

      {/* 4. Stats, FAQ & CTA */}
      <FaqAndTestimonials />
    </div>
  );
}
