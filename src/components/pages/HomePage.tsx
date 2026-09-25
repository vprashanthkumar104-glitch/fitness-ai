import React, { useState } from 'react';
import { Page, FocusArea } from '../../types';
import { FOCUS_AREAS, STATS, TESTIMONIALS } from '../../data/fitnessData';
import { useAuth } from '../../context/AuthContext';
import {
  Dumbbell,
  Utensils,
  Trophy,
  Sliders,
  HeartPulse,
  Cpu,
  Activity,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArea, setActiveArea] = useState<FocusArea | null>(null);

  const categories = ['All', 'Training', 'Nutrition', 'Motivation', 'Gear & Tech', 'Recovery', 'Innovation', 'Mechanics'];

  const filteredAreas = selectedCategory === 'All'
    ? FOCUS_AREAS
    : FOCUS_AREAS.filter(area => area.category === selectedCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell':
        return <Dumbbell className="w-6 h-6 text-emerald-400" />;
      case 'Utensils':
        return <Utensils className="w-6 h-6 text-teal-400" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-amber-400" />;
      case 'Sliders':
        return <Sliders className="w-6 h-6 text-cyan-400" />;
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6 text-rose-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-indigo-400" />;
      default:
        return <Dumbbell className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden border-b border-slate-900">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-12 right-10 w-72 h-72 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Next-Generation Intelligent Fitness • Version 1</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-[1.12]">
                Your AI-Powered <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Fitness Journey Starts Here
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl font-normal">
                Unlock personalized workout programming, precision macro nutrition calculations, guided challenges, gear reviews, and biomechanic mastery—all engineered to transform your body with science, not guesswork.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  id="hero-primary-cta"
                  onClick={() => setCurrentPage(user ? 'dashboard' : 'auth')}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-bold text-base bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{user ? 'Open Athlete Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  id="hero-secondary-cta"
                  onClick={() => {
                    const el = document.getElementById('core-pillars-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-base bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Explore Fitness</span>
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required for v1 preview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Evidence-based exercise science</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow border ring */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-teal-500/20 blur-xl opacity-75" />

                <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                  {/* Top card bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-xs font-mono text-slate-400 ml-2">live-coaching-engine.ai</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                    </span>
                  </div>

                  {/* Program Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Today&apos;s Workout</span>
                        <h4 className="text-lg font-bold text-white">Upper Body Hypertrophy &amp; Core</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Target Time</span>
                        <p className="text-sm font-bold text-slate-200">48 Mins</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Intensity: High RPE (8.5)</span>
                        <span className="text-emerald-400 font-semibold">4 of 5 Exercises</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[80%] rounded-full" />
                      </div>
                    </div>

                    {/* Workout items preview */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Dumbbell className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-white">DB Incline Chest Press</span>
                            <p className="text-[11px] text-slate-400">4 sets × 8-10 reps • 70 lbs</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-white">Post-Workout Macro Fuel</span>
                            <p className="text-[11px] text-slate-400">42g Protein • 58g Carbs • 8g Fat</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">Calculated</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-white">Consistency Streak</span>
                            <p className="text-[11px] text-emerald-300/80">14 Days Consecutive Logged</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-extrabold text-emerald-300">Level 3 Quest</span>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom action */}
                  <button
                    id="hero-card-explore-btn"
                    onClick={() => setCurrentPage('features')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Preview All 7 AI Capabilities</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS RIBBON */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
                  <span className="text-emerald-400">{stat.value}</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE FOCUS FEATURE CARDS (THE 7 DOMAINS) */}
      <section id="core-pillars-section" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5" />
            Comprehensive Fitness Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white tracking-tight">
            Engineered for Every Dimension of Fitness
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            From smart resistance splits and macro balancing to equipment analysis and biomechanics, Fitness AI delivers precision guidance at every stage.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 7 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredAreas.map((area) => (
            <div
              key={area.id}
              id={`feature-card-${area.id}`}
              className="group relative rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/50 p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-emerald-500/30 transition-colors">
                    {getIcon(area.iconName)}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700/60">
                    {area.badge}
                  </span>
                </div>

                {/* Card Title & Category */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                    {area.category}
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5 group-hover:text-emerald-300 transition-colors">
                    {area.title}
                  </h3>
                </div>

                {/* Tagline & Description */}
                <p className="text-sm font-medium text-slate-200 leading-snug">
                  {area.tagline}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {area.description}
                </p>

                {/* Highlight Bullets */}
                <ul className="space-y-2 pt-2 border-t border-slate-800/80">
                  {area.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Button */}
              <div className="pt-6 mt-4">
                <button
                  id={`btn-explore-${area.id}`}
                  onClick={() => setActiveArea(area)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Learn Details &amp; Tips</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MODAL FOR FOCUS AREA DETAIL (INTERACTIVE EXPERIENCE) */}
      {activeArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  {getIcon(activeArea.iconName)}
                </div>
                <div>
                  <span className="text-xs text-emerald-400 font-semibold">{activeArea.category}</span>
                  <h3 className="text-xl font-bold text-white">{activeArea.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveArea(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p className="font-medium text-white">{activeArea.tagline}</p>
              <p className="text-slate-300">{activeArea.description}</p>
              
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase text-emerald-400">Core Protocols Included:</span>
                <ul className="space-y-2">
                  {activeArea.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveArea(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveArea(null);
                  setCurrentPage('features');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5"
              >
                <span>Explore in AI Features</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TESTIMONIALS */}
      <section className="py-16 sm:py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Community Real Results
            </span>
            <h2 className="text-3xl font-bold font-display text-white">
              Trusted by Athletes &amp; Everyday Movers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t.badge}
                    </span>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800/80">
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              Ready To Level Up?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Start Your AI Fitness Transformation Today
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Experience the power of custom workouts, macro nutrition calculations, and biomechanic guidance in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                id="cta-get-started-bottom"
                onClick={() => setCurrentPage('auth')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
              >
                Get Started Free
              </button>
              <button
                id="cta-view-features-bottom"
                onClick={() => setCurrentPage('features')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
              >
                Explore AI Features
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
