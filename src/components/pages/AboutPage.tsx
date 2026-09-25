import React from 'react';
import { Page } from '../../types';
import {
  Sparkles,
  Target,
  Compass,
  HeartPulse,
  Utensils,
  Dumbbell,
  ShieldCheck,
  CheckCircle2,
  Users,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';

interface AboutPageProps {
  setCurrentPage: (page: Page) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24">
        {/* Header / Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <BrainCircuit className="w-3.5 h-3.5" />
            About Fitness AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            Democratizing Elite Sports Science &amp; Coaching
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-normal">
            Fitness AI was created to replace cookie-cutter PDF workout templates and contradictory diet advice with dynamic, intelligent guidance tailored to your body and lifestyle.
          </p>
        </div>

        {/* What is Fitness AI? */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Our Core Identity
            </span>
            <h2 className="text-3xl font-bold font-display text-white">
              What is Fitness AI?
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Fitness AI is an adaptive, all-in-one fitness intelligence platform. By combining physiological principles, progressive overload algorithms, and nutritional science, Fitness AI crafts personalized pathways for individuals of any experience level.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Whether you are training in a fully equipped commercial gym, working out with a pair of dumbbells in your living room, or preparing for your first half-marathon, our engine removes guesswork so you can direct 100% of your energy toward consistency and execution.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-2xl font-bold text-emerald-400">100%</span>
                <p className="text-xs text-slate-400 font-medium">Personalized to your schedule and equipment</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-2xl font-bold text-teal-400">ACSM</span>
                <p className="text-xs text-slate-400 font-medium">Built on validated exercise physiology standards</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] pointer-events-none" />
              
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                The Fitness AI Philosophy
              </h3>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Sustainability Over Extremes</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No starvation diets or 7-day-a-week burnout routines. We prioritize progressive adaptation that integrates into your daily life.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Biomechanical Safety First</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Every exercise recommendation prioritizes joint integrity, proper tempo, and movement variations suited to your mobility.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Data Over Dogma</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      We calibrate programs according to your recorded progress, fatigue signals, and measurable strength markers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white">Our Mission</h3>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              To make evidence-based fitness guidance universally accessible. We empower every individual—regardless of budget, location, or schedule—with the tools, insights, and motivation needed to achieve their personal physical peak.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 space-y-4 hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white">Our Vision</h3>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              A future where fitness is proactive, intuitive, and seamlessly integrated with modern technology. We envision a world where personalized health intelligence prevents chronic lifestyle illness and unlocks human vitality.
            </p>
          </div>
        </div>

        {/* How AI Helps Users (The 4 Core Pillars) */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              The AI Advantage
            </span>
            <h2 className="text-3xl font-bold font-display text-white">
              How AI Accelerates Your Transformation
            </h2>
            <p className="text-slate-400 text-sm">
              Explore how our artificial intelligence engine assists you across the four essential pillars of health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Workouts */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Smart Workouts</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatically designs training splits that calculate volume load, specify rest intervals, and adapt exercise selections when gym equipment is unavailable or busy.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li>• Real-time exercise substitutions</li>
                <li>• Progressive overload cues</li>
                <li>• Muscle recovery tracking</li>
              </ul>
            </div>

            {/* Pillar 2: Nutrition */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 hover:border-teal-500/40 transition-all">
              <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 w-fit">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Tailored Nutrition</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates precise caloric balance, protein synthesis targets, and nutrient timing based on your metabolic rate, workout intensity, and weight goals.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li>• Custom macro breakdown</li>
                <li>• Pre &amp; post workout nutrition</li>
                <li>• Dietary allergy compatibility</li>
              </ul>
            </div>

            {/* Pillar 3: Fitness Journeys */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Guided Journeys</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Breaks down lofty 6-month or 1-year fitness aspirations into realistic 7-day micro-milestones that keep motivation sharp and monitor consistency streaks.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li>• 30 &amp; 90-day structured quests</li>
                <li>• Habit streak stabilization</li>
                <li>• Plateau detection alerts</li>
              </ul>
            </div>

            {/* Pillar 4: Wellness & Recovery */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 hover:border-rose-500/40 transition-all">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">4. Total Wellness</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recognizes that adaptation happens during sleep and recovery. Calibrates training intensity using heart-rate variability cues and mobility protocols.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li>• Sleep &amp; HRV recovery score</li>
                <li>• Joint mobility routines</li>
                <li>• Stress regulation techniques</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team / Commitment Box */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Ready to experience intelligent fitness coaching?
            </h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Preview our planned AI features or create your free account to join the Version 1 community.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentPage('features')}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore AI Features</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
