import React from 'react';
import {
  HomeAnnouncementBar,
  HomeHeroSection,
  HomeCalculatorSection,
  HomeImpactStats,
  HomeHowItWorksSection,
  HomeWhyChooseSection,
  HomeProductsMatrix,
  HomeStoriesCarousel,
  HomeCtaBanner,
} from './components/home';

export function HomePage() {
  return (
    <div className="min-h-screen bg-surface-canvas text-on-surface">
      {/* Top Rates & Community Announcement Bar */}
      <HomeAnnouncementBar />

      {/* Main Content Body */}
      <main className="w-full bg-background">
        <div className="flex flex-col w-full">
          {/* Top Hero & Interactive Financial Calculator Section */}
          <section id="calculator-section" className="relative w-full bg-surface-dark overflow-hidden py-6 sm:py-8 lg:py-10 px-gutter">
            {/* Atmospheric glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center relative z-10">
              <HomeHeroSection />
              <HomeCalculatorSection />
            </div>
          </section>

          {/* Community Impact & Vital Statistics Strip */}
          <HomeImpactStats />

          {/* Effortless Membership - 3 Steps Strip */}
          <HomeHowItWorksSection />

          {/* "Why Choose Unako" / Banking, But Better Narrative */}
          <HomeWhyChooseSection />

          {/* Comprehensive Cooperative Product Comparison Matrix */}
          <HomeProductsMatrix />

          {/* Social Proof & Member Stories Carousel Strip */}
          <HomeStoriesCarousel />

          {/* Final High-Conversion Banner */}
          <HomeCtaBanner />
        </div>
      </main>
    </div>
  );
}
