"use client";

import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";

interface UploadSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillUploaded: () => void;
}

export default function UploadSkillModal({
  isOpen,
  onClose,
  onSkillUploaded,
}: UploadSkillModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // File size validation (50 MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 50 MB limit.`);
        continue;
      }

      let content = "";
      try {
        content = await file.text();
      } catch (e) {
        content = `Binary or archive file: ${file.name}`;
      }

      try {
        await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name.replace(/\.[^/.]+$/, ""),
            description: `Uploaded from file ${file.name}`,
            content,
            sourceType: "file",
            fileName: file.name,
          }),
        });
      } catch (err) {
        console.error("Failed to upload skill", err);
      }
    }

    setIsUploading(false);
    onSkillUploaded();
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-xs text-slate-200 select-none relative">
        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          multiple
          accept=".md,.zip,.skill,.json,.js,.py,.txt"
          className="hidden"
        />

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Upload skill</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Upload Box (Screenshot Design) */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? "border-red-500 bg-red-500/10"
              : "border-white/15 hover:border-white/30 bg-[#1a1a1a]/50"
          }`}
        >
          <Upload className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-200">
            {isUploading ? "Uploading skill file..." : "Drag and drop or click to upload"}
          </p>
        </div>

        {/* File Requirements List (Screenshot Design) */}
        <div className="flex flex-col gap-2 pt-1">
          <h3 className="text-xs font-bold text-slate-300">File requirements</h3>
          <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside leading-relaxed">
            <li>.md file must contain skill name and description formatted in YAML</li>
            <li>.zip or .skill file must include a SKILL.md file</li>
            <li>File size must not exceed 50 MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
