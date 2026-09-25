import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Database,
  ArrowRight,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Activity,
  Bug
} from 'lucide-react';
import { KnowledgeChunk, RAGQueryResult } from '../../types';
import { askKnowledgeBase } from '../../lib/ragPipeline';

interface RAGQuerySectionProps {
  chunks: KnowledgeChunk[];
  totalDocsCount: number;
}

const SAMPLE_QUERIES = [
  {
    label: 'What is Fitness AI?',
    query: 'What is Fitness AI?',
  },
  {
    label: 'Supported Workouts',
    query: 'What workout routines and periodization splits are supported?',
  },
  {
    label: 'Nutrition Guidelines',
    query: 'What nutrition information and protein recommendations are available?',
  },
  {
    label: 'Hypertrophy Volume',
    query: 'What are the volume thresholds and RIR for hypertrophy?',
  },
  {
    label: 'Deload & Sleep',
    query: 'How often should compound lifts be deloaded and how does sleep affect recovery?',
  },
  {
    label: 'Out-of-Domain Test',
    query: 'What is the average rainfall in the Amazon rainforest?',
  },
];

export const RAGQuerySection: React.FC<RAGQuerySectionProps> = ({ chunks, totalDocsCount }) => {
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RAGQueryResult | null>(null);
  const [showChunks, setShowChunks] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSearch = async (queryText?: string) => {
    const q = (queryText ?? queryInput).trim();
    if (!q) return;

    setLoading(true);
    setResult(null);
    setStatusMessage('Searching vector embeddings and scoring chunk relevance...');

    try {
      // Simulate minor step transition for transparency
      setTimeout(() => {
        if (loading) {
          setStatusMessage('Synthesizing answer using retrieved knowledge chunks...');
        }
      }, 400);

      const res = await askKnowledgeBase(q, chunks);
      setResult(res);
      // Auto open chunks if matches found
      if (res.retrievedChunks && res.retrievedChunks.length > 0) {
        setShowChunks(true);
      }
    } catch (err) {
      console.error('RAG search error:', err);
      setResult({
        answer: "I couldn't find this information in the knowledge base.",
        hasKnowledge: false,
        retrievedChunks: [],
        queryTimeMs: 0,
      });
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectSample = (sample: string) => {
    setQueryInput(sample);
    handleSearch(sample);
  };

  const handleReset = () => {
    setQueryInput('');
    setResult(null);
    setShowChunks(false);
  };

  return (
    <div
      id="rag-assistant-section"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                RAG Knowledge Base Assistant
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Ground-Truth AI
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Ask questions grounded strictly in your uploaded documents. Vector embeddings and semantic chunks prevent hallucinations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="text-slate-200">{chunks.length}</strong> active chunks
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <strong className="text-slate-200">{totalDocsCount}</strong> source docs
            </span>
          </div>
        </div>

        {/* Search Input Field */}
        <div className="relative mt-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="rag-query-input"
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question (e.g. What are the volume thresholds for hypertrophy?)..."
              disabled={loading}
              className="w-full pl-12 pr-28 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base transition-all disabled:opacity-60"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {queryInput && !loading && (
                <button
                  type="button"
                  onClick={handleReset}
                  title="Clear input"
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                id="rag-submit-btn"
                type="button"
                onClick={() => handleSearch()}
                disabled={loading || !queryInput.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-semibold rounded-lg text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Ask RAG</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Try asking:</span>
          {SAMPLE_QUERIES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(item.query)}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition-colors text-left"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State Animation */}
      {loading && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 mt-4 animate-pulse">
          <div className="flex items-center gap-3 text-emerald-400 mb-3">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{statusMessage || 'Processing question via RAG pipeline...'}</span>
          </div>
          <div className="h-4 bg-slate-800 rounded w-3/4 mb-2.5" />
          <div className="h-4 bg-slate-800 rounded w-5/6 mb-2.5" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
        </div>
      )}

      {/* RAG Answer Display */}
      {result && !loading && (
        <div
          id="rag-answer-container"
          className={`mt-4 rounded-xl border transition-all ${
            result.hasKnowledge
              ? 'bg-slate-950/90 border-emerald-500/30'
              : 'bg-slate-950/90 border-amber-500/30'
          } p-5 sm:p-6`}
        >
          {/* Answer Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              {result.hasKnowledge ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Answer Grounded in Knowledge Base</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Out of Domain / Not Found in Documents</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {result.queryTimeMs}ms
              </span>
              {result.modelUsed && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono text-[11px]">
                  {result.modelUsed}
                </span>
              )}
            </div>
          </div>

          {/* Answer Body */}
          <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-4 font-normal">
            {result.answer}
          </div>

          {/* Cited Documents */}
          {result.retrievedChunks && result.retrievedChunks.length > 0 && result.hasKnowledge && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Cited Source Files:</span>
              {Array.from(new Set(result.retrievedChunks.map((c) => c.chunk.docName))).map((docName, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 text-emerald-300 border border-slate-700/60 font-mono text-[11px]"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  {docName}
                </span>
              ))}
            </div>
          )}

          {/* Toggle Retrieved Context Chunks Drawer */}
          {result.retrievedChunks && result.retrievedChunks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowChunks(!showChunks)}
                className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 py-1 transition"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Retrieved Knowledge Chunks ({result.retrievedChunks.length} chunks analyzed)
                </span>
                <span className="flex items-center gap-1 text-slate-500 hover:text-slate-400">
                  {showChunks ? 'Hide Chunks' : 'View Chunks'}
                  {showChunks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              {showChunks && (
                <div className="mt-3 space-y-2.5">
                  {result.retrievedChunks.map((item, idx) => (
                    <div
                      key={item.chunk.id || idx}
                      className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                        <span className="font-semibold text-slate-200 flex items-center gap-1 font-mono">
                          <FileText className="w-3 h-3 text-emerald-400" />
                          {item.chunk.docName} (Chunk #{item.chunk.chunkIndex + 1})
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            item.similarity >= 0.7
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {Math.round(item.similarity * 100)}% Match
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed font-sans text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                        {item.chunk.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* RAG Diagnostics & Index Status Accordion */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 py-1 transition"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Bug className="w-3.5 h-3.5 text-amber-400" />
            RAG Pipeline Diagnostics & Vector Index Status
          </span>
          <span className="flex items-center gap-1 text-slate-500 hover:text-slate-400">
            {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
            {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showDiagnostics && (
          <div className="mt-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Documents Indexed</span>
                <span className="text-base font-bold text-white font-mono">{totalDocsCount}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Chunks in Vector Memory</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{chunks.length}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Embedding Model</span>
                <span className="text-xs font-semibold text-sky-400 font-mono">gemini-embedding-2</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">Synthesis Engine</span>
                <span className="text-xs font-semibold text-purple-400 font-mono">gemini-3.1-flash-lite</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2 flex items-center justify-between">
              <span>Status: <strong className="text-emerald-400">RAG Vector Retrieval Active</strong></span>
              <span>Min Search Threshold: <strong className="text-slate-300 font-mono">0.25</strong></span>
              <span>Hybrid Weight: <strong className="text-slate-300 font-mono">65% Semantic / 35% Lexical</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
