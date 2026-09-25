import React, { useState } from 'react';
import { Page } from '../types';
import { Dumbbell, Menu, X, Sparkles, User, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  userEmail,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'AI Features', page: 'features' },
    { label: 'Knowledge Base', page: 'knowledge' },
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Contact', page: 'contact' },
    { label: 'Sign In', page: 'auth' },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="Fitness AI Home"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
              <Dumbbell className="w-6 h-6 stroke-[2.2]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-white group-hover:text-emerald-400 transition-colors">
                Fitness <span className="text-emerald-400">AI</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Version 1.0
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.page;
              if (item.page === 'auth') {
                return null; // Rendered as distinct CTA
              }
              return (
                <button
                  key={item.page}
                  id={`nav-link-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  {item.label}
                  {item.page === 'features' && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      NEW
                    </span>
                  )}
                  {item.page === 'knowledge' && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      RAG
                    </span>
                  )}
                  {item.page === 'dashboard' && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700/60 text-emerald-400 border border-slate-700">
                      PRIVATE
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA / User Area */}
          <div className="hidden md:flex items-center gap-3">
            {userEmail ? (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl">
                <button
                  id="nav-user-profile-btn"
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
                  title="Open Private Dashboard"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">
                    {userEmail}
                  </span>
                </button>
                <button
                  id="btn-signout"
                  onClick={onSignOut}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 ml-1 hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                id="nav-link-auth"
                onClick={() => handleNavClick('auth')}
                className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  currentPage === 'auth'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30'
                }`}
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={`mobile-${item.page}`}
                id={`mobile-nav-${item.page}`}
                onClick={() => handleNavClick(item.page)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.page === 'features' && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300">
                    AI
                  </span>
                )}
                {item.page === 'knowledge' && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-500/20 text-teal-300">
                    RAG
                  </span>
                )}
              </button>
            );
          })}
          {userEmail && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-4 py-2">
              <span className="text-xs text-slate-400 truncate max-w-[200px]">
                Signed in as: {userEmail}
              </span>
              <button
                onClick={() => {
                  onSignOut?.();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-rose-400 hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
