import React, { useState } from 'react';
import { KnowledgeDocument } from '../../types';
import {
  X,
  FileText,
  File,
  Download,
  Copy,
  Check,
  Search,
  Database,
  Calendar,
  Layers,
  FileCode
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: KnowledgeDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!document) return null;

  const handleCopyText = async () => {
    const textToCopy = document.fullContent || document.contentPreview || '';
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      console.warn('Failed to copy to clipboard');
    }
  };

  const handleDownloadOriginal = () => {
    if (document.dataUrl) {
      const a = window.document.createElement('a');
      a.href = document.dataUrl;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      // Create blob from text
      const content = document.fullContent || document.contentPreview || '';
      const blob = new Blob([content], { type: document.mimeType || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const textContent = document.fullContent || document.contentPreview || 'No readable text content extracted.';

  // Highlight search term in text preview
  const renderHighlightedContent = () => {
    if (!searchTerm.trim()) {
      return textContent;
    }
    const parts = textContent.split(new RegExp(`(${searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={index} className="bg-emerald-400 text-slate-950 px-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              {document.fileType === 'pdf' ? (
                <FileText className="w-5 h-5 text-rose-400" />
              ) : document.fileType === 'txt' ? (
                <FileText className="w-5 h-5 text-emerald-400" />
              ) : (
                <File className="w-5 h-5 text-sky-400" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate max-w-md">
                {document.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="uppercase font-semibold text-emerald-400">
                  {document.fileType}
                </span>
                <span>•</span>
                <span>{document.formattedSize}</span>
                <span>•</span>
                <span>ID: {document.id.slice(0, 14)}...</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-slate-950/50 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">RAG Status</span>
              <span className="text-emerald-300 font-bold capitalize">{document.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Volume</span>
              <span>{document.charCount.toLocaleString()} chars ({document.wordCount.toLocaleString()} words)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Uploaded</span>
              <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Storage</span>
              <span>Local & Firestore</span>
            </div>
          </div>
        </div>

        {/* Search within document */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keywords inside this document..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Copy extracted text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadOriginal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-slate-950">
          {renderHighlightedContent()}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>This text is indexed and ready for AI retrieval-augmented prompting.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
