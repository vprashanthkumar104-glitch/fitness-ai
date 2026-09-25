import React, { useState, useEffect } from 'react';
import { Page, KnowledgeDocument, KnowledgeChunk } from '../../types';
import { FileUploadZone } from '../knowledge/FileUploadZone';
import { KnowledgeList } from '../knowledge/KnowledgeList';
import { DocumentViewerModal } from '../knowledge/DocumentViewerModal';
import { RAGQuerySection } from '../knowledge/RAGQuerySection';
import {
  getAllKnowledgeDocs,
  getAllKnowledgeChunks,
  saveKnowledgeDoc,
  deleteKnowledgeDoc,
  extractTextFromFile,
  formatBytes,
  getFileExtension
} from '../../lib/knowledgeStore';
import {
  BookOpen,
  FileCheck,
  Zap,
  Sparkles,
  ArrowLeft,
  Search,
  Database,
  Layers
} from 'lucide-react';

interface KnowledgeBasePageProps {
  setCurrentPage: (page: Page) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  setCurrentPage,
}) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [activeDocForViewer, setActiveDocForViewer] = useState<KnowledgeDocument | null>(null);

  // Load documents and RAG chunks on mount
  useEffect(() => {
    loadDocumentsAndChunks();
  }, []);

  const loadDocumentsAndChunks = async () => {
    try {
      setIsLoading(true);
      const [docs, loadedChunks] = await Promise.all([
        getAllKnowledgeDocs(),
        getAllKnowledgeChunks(),
      ]);
      setDocuments(docs);
      setChunks(loadedChunks);
    } catch (err) {
      console.error('Failed to load knowledge documents or chunks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Step 1: Text parsing
      setUploadProgress(45);
      const extracted = await extractTextFromFile(file);

      setUploadProgress(70);
      const fileExt = getFileExtension(file.name);

      const newDoc: KnowledgeDocument = {
        id: `kb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: file.name,
        fileType: fileExt,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        formattedSize: formatBytes(file.size),
        uploadedAt: new Date().toISOString(),
        status: 'ready',
        contentPreview: extracted.preview,
        fullContent: extracted.text,
        dataUrl: extracted.dataUrl,
        charCount: extracted.charCount,
        wordCount: extracted.wordCount,
        tags: [fileExt.toUpperCase(), 'Fitness Knowledge'],
      };

      // Step 2: Save document & generate chunks + embeddings
      await saveKnowledgeDoc(newDoc);
      setUploadProgress(95);

      // Refresh chunks
      const refreshedChunks = await getAllKnowledgeChunks();
      setChunks(refreshedChunks);

      setUploadProgress(100);

      // Optimistic update
      setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic remove
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setChunks((prev) => prev.filter((c) => c.docId !== id));
    if (activeDocForViewer?.id === id) {
      setActiveDocForViewer(null);
    }
    await deleteKnowledgeDoc(id);
    const refreshed = await getAllKnowledgeChunks();
    setChunks(refreshed);
  };

  const handleView = (doc: KnowledgeDocument) => {
    setActiveDocForViewer(doc);
  };

  // Metrics calculations
  const totalCharacters = documents.reduce((sum, d) => sum + (d.charCount || 0), 0);
  const totalWords = documents.reduce((sum, d) => sum + (d.wordCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-6">
          <button
            onClick={() => setCurrentPage('home')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="relative mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RAG Vector Retrieval Pipeline</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display">
            Knowledge <span className="text-emerald-400">Base</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed">
            Upload authoritative fitness research, personalized training splits, mobility protocols, and nutrition guidelines (PDF, DOC, DOCX, TXT). Uploaded documents are automatically chunked, embedded, and indexed for our Retrieval-Augmented Generation pipeline.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Indexed Documents</span>
              </div>
              <div className="text-2xl font-black text-white font-display">
                {documents.length}
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Ready for retrieval</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Vector Chunks</span>
              </div>
              <div className="text-2xl font-black text-white font-display">
                {chunks.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Embedded for similarity search</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>Supported Formats</span>
              </div>
              <div className="text-2xl font-black text-white font-display">
                4 Types
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">PDF • DOC • DOCX • TXT</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>RAG Pipeline</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-display flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ground-truth verified</div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="space-y-8">
          {/* File Upload Zone */}
          <FileUploadZone
            onUpload={handleUpload}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />

          {/* Interactive RAG Question & Retrieval Assistant */}
          <RAGQuerySection
            chunks={chunks}
            totalDocsCount={documents.length}
          />

          {/* Uploaded File Inventory with Search, View, and Delete */}
          <KnowledgeList
            documents={documents}
            onView={handleView}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        document={activeDocForViewer}
        onClose={() => setActiveDocForViewer(null)}
      />
    </div>
  );
};

