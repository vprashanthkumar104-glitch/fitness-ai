import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  X,
  Bot,
  User,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  Info,
  ShieldCheck,
  FileText,
  RotateCcw
} from 'lucide-react';
import { getAllKnowledgeChunks } from '../../lib/knowledgeStore';
import { askKnowledgeBase, checkMedicalSafety } from '../../lib/ragPipeline';
import { useAuth } from '../../context/AuthContext';
import { sendFitnessAutomationWebhook } from '../../lib/n8nWebhook';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
  isError?: boolean;
}

const SESSION_STORAGE_KEY = 'fitness_ai_chat_session_history';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-0',
  sender: 'ai',
  text: "Hello! I'm your Fitness AI Coach. I'm connected directly to your Fitness AI knowledge base.\n\nYou can ask me about workout routines, nutrition and diet, fitness challenges, fitness equipment, health and wellness, fitness technology, or training techniques!",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_QUESTIONS = [
  { label: 'Workout Splits', prompt: 'What are the recommended training splits for hypertrophy?' },
  { label: 'Nutrition & Macros', prompt: 'What is the optimal daily protein intake for muscle recovery?' },
  { label: 'Core Challenge', prompt: 'How does the 30-Day Functional Core Quest work?' },
  { label: 'Home Gym Gear', prompt: 'What equipment is recommended for an effective home gym?' },
  { label: 'Sleep & HRV', prompt: 'How do sleep and Heart Rate Variability affect workout recovery?' },
  { label: 'Fitness Tech', prompt: 'How should I track Zone 2 cardio and wearable biometrics?' },
  { label: 'Training Techniques', prompt: 'How do RPE and Reps in Reserve (RIR) work in training?' },
];

export const FitnessChatbot: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationToast, setAutomationToast] = useState<{ message: string; isError: boolean } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize chat messages with session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Session storage limit or sandbox restriction
    }
  }, [messages]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleClearChat = () => {
    const freshMessages = [
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(freshMessages);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query || isLoading) return;

    // Clear input field
    setInputQuery('');

    // 1. Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 2. Safety Guardrail Check
      const safetyWarning = checkMedicalSafety(query);
      if (safetyWarning) {
        const safetyMessage: ChatMessage = {
          id: `ai-safety-${Date.now()}`,
          sender: 'ai',
          text: safetyWarning,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, safetyMessage]);
        setIsLoading(false);
        return;
      }

      // 3. Retrieve relevant chunks from Knowledge Base
      const allChunks = await getAllKnowledgeChunks();

      // 4. Query RAG with context
      const ragResult = await askKnowledgeBase(query, allChunks);

      // 5. Build response message
      const aiResponseText = ragResult.hasKnowledge && ragResult.answer
        ? ragResult.answer
        : "I couldn't find enough information about this in the Fitness AI knowledge base.";

      const citedSources = ragResult.retrievedChunks && ragResult.hasKnowledge
        ? Array.from(new Set(ragResult.retrievedChunks.map((m) => m.chunk.docName)))
        : [];

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: citedSources.length > 0 ? citedSources : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Friendly fallback error handling without crashing
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: "I couldn't find enough information about this in the Fitness AI knowledge base. Please check your query or verify your indexed knowledge base documents.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Auto-dismiss automation toast notification
  useEffect(() => {
    if (automationToast) {
      const timer = setTimeout(() => {
        setAutomationToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [automationToast]);

  // Handle click on AI Assistant button
  const handleAssistantClick = async () => {
    // 8. Do not send the request if the user is not logged in.
    if (!user) {
      setIsOpen(true);
      return;
    }

    // 5. Show a small loading state on the AI Assistant button while the request is being sent.
    setIsAutomating(true);
    try {
      const result = await sendFitnessAutomationWebhook(user, userProfile);
      setAutomationToast({
        message: result.message,
        isError: !result.success,
      });
    } catch {
      setAutomationToast({
        message: 'Unable to connect to Fitness AI automation. Please try again.',
        isError: true,
      });
    } finally {
      setIsAutomating(false);
      setIsOpen(true);
    }
  };

  return (
    <aside aria-label="AI Fitness Chatbot Widget">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          id="fitness-chatbot-toggle-btn"
          data-testid="ai-assistant-btn"
          aria-label="AI Assistant"
          onClick={handleAssistantClick}
          disabled={isAutomating}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95 group border border-emerald-400/40 disabled:opacity-85 cursor-pointer"
          title="Open AI Assistant"
        >
          <div className="relative">
            {isAutomating ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <>
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
                </span>
              </>
            )}
          </div>
          <span className="text-sm font-semibold tracking-wide">
            {isAutomating ? 'Connecting...' : 'AI Assistant'}
          </span>
          <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Automation Toast Alert when closed */}
      {automationToast && !isOpen && (
        <div
          role="status"
          className={`fixed bottom-20 right-5 z-50 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border ${
            automationToast.isError
              ? 'bg-rose-950/95 text-rose-200 border-rose-500/40 shadow-rose-950/50'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
          }`}
        >
          {automationToast.isError ? (
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{automationToast.message}</span>
        </div>
      )}

      {/* Expandable Chatbot Window */}
      {isOpen && (
        <div
          id="fitness-chatbot-window"
          className="fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[440px] max-h-[88vh] h-[640px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-950"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-wide">Fitness AI Chatbot</h3>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    RAG
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Knowledge Base Grounded Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear Chat Button */}
              <button
                id="fitness-chatbot-clear-btn"
                type="button"
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Clear current chat session"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                id="fitness-chatbot-close-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Minimize chatbot"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Webhook Status Notice inside chat window */}
          {automationToast && (
            <div
              className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b ${
                automationToast.isError
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
              }`}
            >
              <div className="flex items-center gap-2">
                {automationToast.isError ? (
                  <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span>{automationToast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setAutomationToast(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                aria-label="Dismiss message"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Prompt Topics Bar */}
          <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 pr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Topics:
            </span>
            {SUGGESTED_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 hover:text-emerald-300 hover:bg-slate-700/80 border border-slate-700/50 transition-all shrink-0 disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Message Area */}
          <div
            id="fitness-chatbot-message-area"
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-900 to-slate-950"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {/* Message Body */}
                    <div className="whitespace-pre-line break-words">{msg.text}</div>

                    {/* Cited Source Documents Badges */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <FileText className="w-3 h-3" />
                          <span>Sources used:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px]"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Metadata & Copy */}
                    <div
                      className={`flex items-center justify-between gap-3 mt-1.5 text-[10px] ${
                        isUser ? 'text-emerald-200/80' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="hover:text-emerald-400 transition-colors p-0.5 flex items-center gap-1"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-[9px] text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start animate-in fade-in duration-150">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-800/90 text-slate-300 border border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-slate-300">
                    Checking knowledge base &amp; formulating response...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Area */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                id="fitness-chatbot-input"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about workouts, nutrition, techniques, gear..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 outline-none transition-all disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                id="fitness-chatbot-send-btn"
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all duration-150 disabled:cursor-not-allowed shrink-0"
                title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Ground truth from Fitness AI knowledge base
              </span>
              <span>Session storage only</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
