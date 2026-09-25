import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  Upload,
  FileText,
  File,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatBytes, getFileExtension } from '../../lib/knowledgeStore';

interface FileUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onUpload,
  isUploading,
  uploadProgress,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setUploadSuccess(false);

    const ext = getFileExtension(file.name);
    if (!allowedExtensions.includes(ext)) {
      setErrorMessage(`Unsupported format .${ext}. Please upload PDF, DOC, DOCX, or TXT files.`);
      setSelectedFile(null);
      return;
    }

    // 25MB max size safeguard
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25 MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || isUploading) return;
    try {
      await onUpload(selectedFile);
      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch {
      setErrorMessage('Failed to process and store document. Please try again.');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFormatBadgeStyle = (ext: string) => {
    switch (ext) {
      case 'pdf':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'docx':
      case 'doc':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'txt':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-emerald-400" />
            <span>Upload Document to Knowledge Base</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Files are parsed, indexed, and stored for the Fitness AI RAG retrieval pipeline.
          </p>
        </div>

        {/* Accepted Formats Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Supported:</span>
          {['PDF', 'DOC', 'DOCX', 'TXT'].map((ext) => (
            <span
              key={ext}
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getFormatBadgeStyle(
                ext.toLowerCase()
              )}`}
            >
              {ext}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="knowledge-file-input"
        type="file"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Drag & Drop Area */}
      {!selectedFile ? (
        <div
          id="dropzone-knowledge-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800/50 bg-slate-950/40'
          }`}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <Upload className="w-8 h-8 stroke-[1.8]" />
            </div>

            <p className="text-base font-semibold text-white">
              Drag and drop your document here, or{' '}
              <span className="text-emerald-400 underline underline-offset-4 font-bold">
                browse files
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Accepts PDF research papers, Word doc workout plans, and text coaching notes up to 25 MB.
            </p>
          </div>
        </div>
      ) : (
        /* Selected File Review Box */
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 sm:p-6 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                {selectedFile.name.endsWith('.pdf') ? (
                  <FileText className="w-6 h-6 text-rose-400" />
                ) : selectedFile.name.endsWith('.txt') ? (
                  <FileText className="w-6 h-6 text-emerald-400" />
                ) : (
                  <File className="w-6 h-6 text-sky-400" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h3>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${getFormatBadgeStyle(
                      getFileExtension(selectedFile.name)
                    )}`}
                  >
                    {getFileExtension(selectedFile.name)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Size: {formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span>Type: {selectedFile.type || 'Document'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Ready to upload</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={isUploading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Cancel selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Progress Bar if Uploading */}
          {isUploading && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Extracting text & indexing for RAG pipeline...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={isUploading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
            >
              Choose Different File
            </button>

            <button
              type="button"
              id="btn-confirm-upload"
              onClick={handleUploadSubmit}
              disabled={isUploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>Upload & Index Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {uploadSuccess && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <div className="text-sm">
            <span className="font-bold">Document successfully indexed!</span> Your document is now stored and ready for retrieval by the Fitness AI RAG pipeline.
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}
    </div>
  );
};
