import React from 'react';
import { Page } from '../types';
import { Dumbbell, Heart, Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const handleNav = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20">
                <Dumbbell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-bold font-display text-white">
                Fitness <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Empowering athletes and fitness enthusiasts with intelligent workout programming, personalized nutrition science, dynamic challenges, and biomechanic guidance.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Version 1.0 Release
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
                <Shield className="w-3 h-3 text-teal-400" />
                Science-Backed
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  id="footer-link-home"
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => handleNav('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Fitness AI
                </button>
              </li>
              <li>
                <button
                  id="footer-link-features"
                  onClick={() => handleNav('features')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  AI Features Showcase
                </button>
              </li>
              <li>
                <button
                  id="footer-link-knowledge"
                  onClick={() => handleNav('knowledge')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Knowledge Base</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    RAG
                  </span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-dashboard"
                  onClick={() => handleNav('dashboard')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Private Dashboard</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AUTH
                  </span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-contact"
                  onClick={() => handleNav('contact')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  id="footer-link-auth"
                  onClick={() => handleNav('auth')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Sign In / Sign Up
                </button>
              </li>
            </ul>
          </div>

          {/* Core Focus Pillars */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Pillars
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Workout Routines & Tips
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Nutrition & Diet
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Challenges & Journeys
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Equipment Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Health & Wellness
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Training Techniques
                </button>
              </li>
            </ul>
          </div>

          {/* Connect & Community */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Community &amp; Cloud
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Join thousands of athletes transforming their lifestyle with data-driven coaching.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firebase Cloud Database Active</span>
              </div>
              <div className="text-slate-400">
                Region: <span className="text-emerald-400">asia-south1</span>
              </div>
              <div className="text-slate-400">
                Email: <span className="text-emerald-400">support@fitnessai.app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Fitness AI. All rights reserved. Version 1 release.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
