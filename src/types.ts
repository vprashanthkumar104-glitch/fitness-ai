export type Page = 'home' | 'about' | 'features' | 'knowledge' | 'dashboard' | 'contact' | 'auth';

export interface KnowledgeDocument {
  id: string;
  userId?: string;
  name: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt';
  mimeType: string;
  fileSize: number;
  formattedSize: string;
  uploadedAt: string;
  status: 'ready' | 'processing' | 'indexed';
  contentPreview: string;
  fullContent?: string;
  dataUrl?: string;
  charCount: number;
  wordCount: number;
  tags?: string[];
}

export interface KnowledgeChunk {
  id: string;
  docId: string;
  docName: string;
  chunkIndex: number;
  text: string;
  embedding?: number[];
  charCount: number;
  wordCount: number;
  createdAt: string;
}

export interface RAGChunkMatch {
  chunk: KnowledgeChunk;
  similarity: number;
}

export interface RAGQueryResult {
  answer: string;
  hasKnowledge: boolean;
  retrievedChunks: RAGChunkMatch[];
  queryTimeMs: number;
  modelUsed?: string;
}

export interface ScheduledWorkout {
  id: string;
  dayLabel: string;
  dateStr: string;
  title: string;
  focus: string;
  durationMinutes: number;
  targetRpe: number;
  intensity: 'Low' | 'Moderate' | 'High' | 'Peak';
  exercisesCount: number;
  status: 'completed' | 'today' | 'upcoming' | 'rest';
  aiRoutinePreview: {
    warmup: string;
    primaryLifts: string[];
    cooldown: string;
  };
}

export interface MetricProgressItem {
  id: string;
  label: string;
  value: string | number;
  subtext: string;
  trend?: string;
  status: 'positive' | 'neutral' | 'warning';
}

export interface FocusArea {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  iconName: string;
  badge: string;
  highlights: string[];
}

export interface AIFeature {
  id: string;
  title: string;
  tag: string;
  badgeText: string;
  description: string;
  iconName: string;
  capabilities: string[];
  samplePrompt: string;
  sampleOutput: {
    headline: string;
    details: string[];
  };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'ai' | 'membership';
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
