'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { MonacoPreviewDemo } from '@/components/landing/MonacoPreviewDemo';
import { CoreFeaturesGrid } from '@/components/landing/CoreFeaturesGrid';
import { FaqAndTestimonials } from '@/components/landing/FaqAndTestimonials';

export default function Home() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Interactive Monaco Preview & AI Review Demo */}
      <MonacoPreviewDemo />

      {/* 3. Core Features Grid */}
      <CoreFeaturesGrid />

      {/* 4. FAQ & Testimonials */}
      <FaqAndTestimonials />
    </div>
  );
}
