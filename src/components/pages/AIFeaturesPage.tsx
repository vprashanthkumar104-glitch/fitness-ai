import React, { useState } from 'react';
import { Page, AIFeature } from '../../types';
import { AI_FEATURES } from '../../data/fitnessData';
import { useAuth } from '../../context/AuthContext';
import { getAllKnowledgeChunks } from '../../lib/knowledgeStore';
import { askKnowledgeBase } from '../../lib/ragPipeline';
import {
  Sparkles,
  Salad,
  Target,
  Flame,
  ShoppingBag,
  Compass,
  MessageSquareText,
  ArrowRight,
  CheckCircle2,
  Copy,
  Zap,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Bot,
  Bookmark,
  BookmarkCheck,
  Trash2
} from 'lucide-react';

interface AIFeaturesPageProps {
  setCurrentPage: (page: Page) => void;
}

export const AIFeaturesPage: React.FC<AIFeaturesPageProps> = ({ setCurrentPage }) => {
  const { user, savedPlans, savePlan, deletePlan } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(AI_FEATURES[0]);
  const [isCopied, setIsCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [interactivePrompt, setInteractivePrompt] = useState(
    'How do I program a 4-day split when recovering from a minor shoulder impingement?'
  );
  const [simulatedAnswer, setSimulatedAnswer] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSaveToProfile = async () => {
    if (!user) {
      setCurrentPage('auth');
      return;
    }
    if (!selectedFeature) return;

    setIsSaving(true);
    setSaveStatus(null);
    try {
      await savePlan({
        title: selectedFeature.sampleOutput.headline,
        content: selectedFeature.sampleOutput.details.join('\n• '),
        featureId: selectedFeature.id,
        category: selectedFeature.tag,
      });
      setSaveStatus('Plan saved to your Firebase Cloud profile!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      setSaveStatus('Failed to save plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-emerald-400" />;
      case 'Salad':
        return <Salad className="w-6 h-6 text-teal-400" />;
      case 'Target':
        return <Target className="w-6 h-6 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-rose-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-indigo-400" />;
      case 'MessageSquareText':
        return <MessageSquareText className="w-6 h-6 text-emerald-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-emerald-400" />;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactivePrompt.trim()) return;

    setIsSimulating(true);
    setSimulatedAnswer(null);

    try {
      const chunks = await getAllKnowledgeChunks();
      const ragResult = await askKnowledgeBase(interactivePrompt, chunks);
      setSimulatedAnswer(ragResult.answer);
    } catch {
      setSimulatedAnswer("I couldn't find this information in the knowledge base.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Version 1 Feature Roadmap &amp; Previews</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            Next-Gen AI Fitness Capabilities
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Discover the 7 specialized AI-powered assistants designed to eliminate plateaus, automate nutrition math, and guide your training biomechanics.
          </p>
        </div>

        {/* 7 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {AI_FEATURES.map((feat) => {
            const isSelected = selectedFeature?.id === feat.id;
            return (
              <div
                key={feat.id}
                id={`ai-card-${feat.id}`}
                className={`rounded-2xl p-6 sm:p-7 transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Top */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      {getFeatureIcon(feat.iconName)}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {feat.badgeText}
                    </span>
                  </div>

                  {/* Title & Tag */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                      {feat.tag}
                    </span>
                    <h3 className="text-xl font-bold text-white font-display mt-0.5">
                      {feat.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Capabilities List */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Key Capabilities:</span>
                    {feat.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-6 mt-4">
                  <button
                    id={`btn-preview-${feat.id}`}
                    onClick={() => {
                      setSelectedFeature(feat);
                      const el = document.getElementById('feature-demo-preview');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Viewing Interactive Preview' : 'Interactive Preview & Output'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* INTERACTIVE DEMO VIEWER / PLACEHOLDER SIMULATOR */}
        {selectedFeature && (
          <div
            id="feature-demo-preview"
            className="rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-10 shadow-2xl space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  {getFeatureIcon(selectedFeature.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      {selectedFeature.tag} Engine
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Frontend Placeholder Simulation
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">
                    {selectedFeature.title} — Output Preview
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(
                      `${selectedFeature.sampleOutput.headline}\n${selectedFeature.sampleOutput.details.join('\n')}`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Copied!' : 'Copy Plan'}</span>
                </button>
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Activate in Sign In
                </button>
              </div>
            </div>

            {/* Simulated Prompt & Simulated Output */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Input Prompt Simulation */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sample Athlete Prompt
                </span>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-300 italic">
                  &ldquo;{selectedFeature.samplePrompt}&rdquo;
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                    Input Parameters Evaluated
                  </span>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Current Training Age &amp; Recovery Capacity</li>
                    <li>• Biomechanical Constraints &amp; Joint Angles</li>
                    <li>• Equipment Access &amp; Time Window Limits</li>
                  </ul>
                </div>
              </div>

              {/* Right: Output Structure Preview */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Generated AI Recommendation
                </span>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-base font-bold text-white border-b border-slate-800/80 pb-2">
                    {selectedFeature.sampleOutput.headline}
                  </h4>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    {selectedFeature.sampleOutput.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Save to Firebase Profile Action */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <button
                      id="btn-save-plan"
                      onClick={handleSaveToProfile}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                      <span>{user ? 'Save Plan to Profile' : 'Sign In to Save Plan'}</span>
                    </button>

                    {saveStatus && (
                      <span className="text-xs font-semibold text-emerald-400 animate-in fade-in flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {saveStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Saved Plans Subcollection Display */}
            {user && savedPlans.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    <span>My Saved Plans in Firebase Firestore ({savedPlans.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Cloud Synced: asia-south1</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-emerald-300 line-clamp-1">{plan.title}</h5>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{plan.content}</p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 flex justify-between">
                        <span>{plan.category || 'Routine'}</span>
                        <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Interactive Prompt Tester */}
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Test a Prompt with the Fitness Q&amp;A Simulator
              </h4>
              <form onSubmit={handleSimulateCustom} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={interactivePrompt}
                  onChange={(e) => setInteractivePrompt(e.target.value)}
                  placeholder="Ask a workout split, macro target, or form question..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSimulating ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Simulation</span>
                    </>
                  )}
                </button>
              </form>

              {simulatedAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 animate-in fade-in">
                  <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Simulated Coach Response:
                  </div>
                  {simulatedAnswer}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Have a specific feature request?</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Our engineering and sports science team values your input as we prepare Version 2.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('contact')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 cursor-pointer"
          >
            Send Feedback via Contact
          </button>
        </div>
      </div>
    </div>
  );
};
