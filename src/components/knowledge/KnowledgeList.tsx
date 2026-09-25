import React, { useState } from 'react';
import { KnowledgeDocument } from '../../types';
import {
  FileText,
  File,
  Search,
  Trash2,
  Eye,
  Database,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface KnowledgeListProps {
  documents: KnowledgeDocument[];
  onView: (doc: KnowledgeDocument) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const KnowledgeList: React.FC<KnowledgeListProps> = ({
  documents,
  onView,
  onDelete,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Filter documents by search and file type
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.contentPreview && doc.contentPreview.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesType =
      selectedType === 'all' ||
      doc.fileType === selectedType ||
      (selectedType === 'doc' && (doc.fileType === 'doc' || doc.fileType === 'docx'));

    return matchesSearch && matchesType;
  });

  const handleDeleteClick = async (id: string) => {
    try {
      setIsDeletingId(id);
      await onDelete(id);
      setDeleteConfirmId(null);
    } finally {
      setIsDeletingId(null);
    }
  };

  const getFormatBadge = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
            PDF
          </span>
        );
      case 'docx':
      case 'doc':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
            DOCX
          </span>
        );
      case 'txt':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            TXT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            FILE
          </span>
        );
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'docx':
      case 'doc':
        return <File className="w-5 h-5 text-sky-400" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Header with Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Indexed Knowledge Documents</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {documents.length} Files
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Reference materials ready for RAG query retrieval by the Fitness AI reasoning models.
          </p>
        </div>

        {/* Filter type tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start lg:self-auto">
          {[
            { label: 'All Formats', value: 'all' },
            { label: 'PDF', value: 'pdf' },
            { label: 'DOC / DOCX', value: 'doc' },
            { label: 'TXT', value: 'txt' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedType === tab.value
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="knowledge-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search documents by title, tags, or content..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Document List View */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Synchronizing knowledge base records...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-14 px-4 text-center rounded-xl bg-slate-950/40 border border-slate-800/80">
          <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-base font-bold text-slate-300">
            {searchTerm ? 'No matching documents found' : 'No documents in knowledge base'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No documents matched "${searchTerm}". Try a different keyword or filter.`
              : 'Upload PDF, DOC, DOCX, or TXT documents using the upload section above to prepare your AI with custom fitness knowledge.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-slate-950/60 hover:bg-slate-950 border border-slate-800/90 hover:border-slate-700/90 rounded-xl p-4 sm:p-5 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* File Information */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getFileIcon(doc.fileType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3
                        onClick={() => onView(doc)}
                        className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors truncate max-w-xs sm:max-w-md lg:max-w-lg"
                        title={doc.name}
                      >
                        {doc.name}
                      </h3>
                      {getFormatBadge(doc.fileType)}

                      {/* Status badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ready for RAG</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span>Size: {doc.formattedSize}</span>
                      <span>•</span>
                      <span>{doc.charCount.toLocaleString()} chars</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Preview Snippet */}
                    {doc.contentPreview && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800/50">
                        "{doc.contentPreview}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: View & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    id={`btn-view-${doc.id}`}
                    type="button"
                    onClick={() => onView(doc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    title="View & Search Document"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View</span>
                  </button>

                  {deleteConfirmId === doc.id ? (
                    <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl animate-in fade-in">
                      <span className="text-[11px] font-semibold text-rose-300 px-2">
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDeleteClick(doc.id)}
                        disabled={isDeletingId === doc.id}
                        className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDeletingId === doc.id ? 'Deleting...' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`btn-delete-${doc.id}`}
                      type="button"
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="inline-flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RAG Context Notice */}
      <div className="mt-8 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">How RAG uses these documents:</span> When you query Fitness AI for customized hypertrophy splits, deload protocols, or diet plans, relevant passages from these uploaded documents are vectorized and injected directly into the Gemini reasoning pipeline as authoritative ground truth.
        </div>
      </div>
    </div>
  );
};
