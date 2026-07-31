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
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251,191,36,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(245,158,11,0.035) 0%, transparent 60%), #08080a',
      }}
    >
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Interactive Monaco Preview and review demo */}
      <MonacoPreviewDemo />

      {/* 3. Core Features Grid */}
      <CoreFeaturesGrid />

      {/* 4. Stats, FAQ & CTA */}
      <FaqAndTestimonials />
    </div>
  );
}
