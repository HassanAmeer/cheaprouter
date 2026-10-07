"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowUpDown,
  ExternalLink,
  Paperclip,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  Music,
  Video,
  File,
  UploadCloud,
  Search,
  Check,
  Copy,
  Eye,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";

export interface UploadedFile {
  id: string;
  userId?: string;
  name: string;
  fileName?: string;
  url?: string;
  size?: number;
  type?: string;
  mimeType?: string;
  createdAt: number;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(type?: string, name?: string) {
  const ext = (name || "").split(".").pop()?.toLowerCase();
  
  if (type === "image" || ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "")) {
    return <ImageIcon className="w-4 h-4 text-rose-300" />;
  }
  if (type === "code" || ["js", "jsx", "ts", "tsx", "py", "html", "css", "json", "sql", "sh"].includes(ext || "")) {
    return <FileCode className="w-4 h-4 text-red-300" />;
  }
  if (type === "document" || ["pdf", "doc", "docx", "txt", "md", "csv", "xlsx"].includes(ext || "")) {
    return <FileText className="w-4 h-4 text-rose-400" />;
  }
  if (type === "audio" || ["mp3", "wav", "ogg", "m4a"].includes(ext || "")) {
    return <Music className="w-4 h-4 text-rose-200" />;
  }
  if (type === "video" || ["mp4", "webm", "mov"].includes(ext || "")) {
    return <Video className="w-4 h-4 text-red-200" />;
  }
  if (type === "archive" || ["zip", "rar", "tar", "gz", "7z"].includes(ext || "")) {
    return <FileArchive className="w-4 h-4 text-rose-400" />;
  }
  return <File className="w-4 h-4 text-rose-300/80" />;
}

export default function FilesSidebarPanel() {
  const [filesList, setFilesList] = useState<UploadedFile[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const itemsPerPage = 7;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFiles = async () => {
    try {
      const res = await fetch("/api/attachments");
      const data = await res.json();
      setFilesList(data.files || []);
    } catch (e) {
      console.error("Failed to load attachments:", e);
    }
  };

  useEffect(() => {
    loadFiles();

    const handleFilesUpdate = () => {
      loadFiles();
    };

    window.addEventListener("cheapchat:files_updated", handleFilesUpdate);
    window.addEventListener("focus", handleFilesUpdate);

    return () => {
      window.removeEventListener("cheapchat:files_updated", handleFilesUpdate);
      window.removeEventListener("focus", handleFilesUpdate);
    };
  }, []);

  const uploadFilesList = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      await loadFiles();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cheapchat:files_updated"));
      }
    } catch (err) {
      console.error("Failed to upload files:", err);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFilesList(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFilesList(e.dataTransfer.files);
    }
  };

  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetch(`/api/attachments?id=${id}`, { method: "DELETE" });
      setFilesList((prev) => prev.filter((f) => f.id !== id));
      if (previewFile?.id === id) setPreviewFile(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = (file: UploadedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.url) {
      const fullUrl = window.location.origin + file.url;
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleSort = (field: "name" | "date" | "size") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  // Filter and sort files
  const filteredFiles = filesList
    .filter((f) => {
      const name = (f.name || f.fileName || "").toLowerCase();
      const matchesQuery = name.includes(filterQuery.toLowerCase());
      if (!matchesQuery) return false;

      if (categoryFilter === "all") return true;
      const type = f.type || "";
      if (categoryFilter === "images") return type === "image";
      if (categoryFilter === "docs") return type === "document";
      if (categoryFilter === "code") return type === "code";
      if (categoryFilter === "media") return type === "audio" || type === "video";
      if (categoryFilter === "archive") return type === "archive";
      return true;
    })
    .sort((a, b) => {
      if (sortField === "name") {
        const nameA = (a.name || a.fileName || "").toLowerCase();
        const nameB = (b.name || b.fileName || "").toLowerCase();
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(a.name);
      } else if (sortField === "size") {
        const sizeA = a.size || 0;
        const sizeB = b.size || 0;
        return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
      } else {
        const dateA = a.createdAt || 0;
        const dateB = b.createdAt || 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

  const totalBytes = filesList.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage) || 1;
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full bg-[#121212] text-slate-200 select-none overflow-hidden border-r border-white/10 relative p-3 gap-2.5 transition-colors ${
        isDragging ? "bg-[#241014] ring-2 ring-red-800/50" : ""
      }`}
    >
      {/* Hidden Native File Input (accepts ALL file types) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
      />

      {/* Header & Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg border border-red-900/50 bg-red-950/40 text-rose-300 flex items-center justify-center">
            <Paperclip className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-white">Files & Attachments</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium">
            {filesList.length} files ({formatBytes(totalBytes)})
          </span>
          <button
            onClick={loadFiles}
            title="Refresh list"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => {
            setFilterQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter files by name..."
          className="w-full bg-[#181818] border border-white/10 rounded-xl pl-8 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-800/70 focus:ring-1 focus:ring-red-900/30 transition"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
        {[
          { key: "all", label: "All" },
          { key: "images", label: "Images" },
          { key: "docs", label: "Docs" },
          { key: "code", label: "Code" },
          { key: "media", label: "Media" },
          { key: "archive", label: "Archives" },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setCategoryFilter(cat.key);
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              categoryFilter === cat.key
                ? "bg-red-950/50 text-rose-200 border border-red-800/60"
                : "bg-[#181818] text-slate-400 hover:text-rose-100 border border-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Files Table Card */}
      <div className="flex-1 border border-white/10 bg-[#161616] rounded-xl overflow-hidden flex flex-col shadow-sm">
        {/* Table Header */}
        <div className="bg-[#1e1e1e]/80 border-b border-white/10 px-3 py-2 flex items-center justify-between text-[11px] font-bold text-slate-300">
          <button
            type="button"
            onClick={() => toggleSort("name")}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <span>Name</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleSort("size")}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <span>Size</span>
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => toggleSort("date")}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <span>Date</span>
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {isUploading && (
            <div className="p-3 bg-red-950/35 border-b border-red-900/40 flex items-center gap-2 text-xs text-rose-200 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading files...</span>
            </div>
          )}

          {paginatedFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-300">No files found</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                Drop any files here or upload from chat/sidebar.
              </p>
            </div>
          ) : (
            paginatedFiles.map((file) => {
              const displayName = file.name || file.fileName || "Unnamed File";
              const isImage = file.type === "image" || displayName.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i);

              return (
                <div
                  key={file.id}
                  onClick={() => setPreviewFile(file)}
                  className="px-3 py-2.5 border-b border-white/5 hover:bg-[#202020] transition flex items-center justify-between gap-2 group text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {isImage && file.url ? (
                        <img
                          src={file.url}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getFileIcon(file.type, displayName)
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate text-xs" title={displayName}>
                        {displayName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Preview / View */}
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open file in new tab"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Download */}
                    {file.url && (
                      <a
                        href={`${file.url}?download=1`}
                        download={displayName}
                        onClick={(e) => e.stopPropagation()}
                        title="Download file"
                        className="p-1 text-slate-400 hover:text-rose-200 rounded hover:bg-red-950/40 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(file, e)}
                      title="Copy file URL"
                      className="p-1 text-slate-400 hover:text-rose-200 rounded hover:bg-red-950/40 transition"
                    >
                      {copiedId === file.id ? (
                        <Check className="w-3.5 h-3.5 text-rose-200" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFile(file.id, e)}
                      title="Delete file"
                      className="p-1 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload / Manage Files Button */}
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-xl border border-red-800/75 bg-red-950/45 px-4 py-2.5 text-xs font-bold text-rose-100 shadow-md shadow-red-950/30 transition hover:border-red-700 hover:bg-red-950/75 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            <span>Upload Any Files</span>
          </>
        )}
      </button>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs pt-0.5 px-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded-lg border border-white/10 bg-[#181818] hover:bg-[#222] text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Prev
        </button>

        <span className="text-[11px] font-semibold text-slate-400 font-mono">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 rounded-lg border border-white/10 bg-[#181818] hover:bg-[#222] text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-text"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-[#181818] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(previewFile.type, previewFile.name)}
                <span className="font-bold text-sm text-white truncate">
                  {previewFile.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({formatBytes(previewFile.size)})
                </span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center min-h-[250px] bg-[#121212]">
              {previewFile.type === "image" || previewFile.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg border border-white/10"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    {getFileIcon(previewFile.type, previewFile.name)}
                  </div>
                  <p className="text-sm font-semibold text-white">{previewFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Uploaded on {new Date(previewFile.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between bg-[#161616]">
              <button
                onClick={(e) => handleCopyLink(previewFile, e)}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#222] hover:bg-[#282828] text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                {copiedId === previewFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-rose-200" />
                    <span>Copied Link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {previewFile.url && (
                  <a
                    href={`${previewFile.url}?download=1`}
                    download={previewFile.name}
                    className="px-4 py-1.5 rounded-xl border border-red-800/75 bg-red-950/45 hover:border-red-700 hover:bg-red-950/75 text-xs font-bold text-rose-100 flex items-center gap-1.5 shadow-md shadow-red-950/30 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
