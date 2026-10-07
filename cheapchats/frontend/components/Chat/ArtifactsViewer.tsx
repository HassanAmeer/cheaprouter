"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAppStore } from "@cheapchats/frontend/lib/store";
import {
  X,
  Copy,
  Download,
  Code,
  Eye,
  FileText,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  FolderTree,
  Folder,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Terminal,
  AlertCircle,
  AlertTriangle,
  Info,
  Brain,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
} from "lucide-react";

interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface ConsoleEntry {
  id: string;
  level: "error" | "warn" | "info" | "log";
  message: string;
  lineno?: number;
  colno?: number;
  filename?: string;
  stack?: string;
  timestamp: number;
  count: number;
}

export default function ArtifactsViewer() {
  const { isArtifactsOpen, toggleArtifacts, activeArtifact, setActiveArtifact, setPendingPromptText } = useAppStore();
  const [activeTab, setActiveTab] = useState<"preview" | "code">("code");
  const [viewDevice, setViewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFilesSidebarOpen, setIsFilesSidebarOpen] = useState(false);

  // Real-time Console & Inspect Element Drawer State
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"console" | "elements">("console");
  const [consoleFilter, setConsoleFilter] = useState<"all" | "error" | "warn" | "log">("all");
  const [consoleSearch, setConsoleSearch] = useState("");
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [copiedAllLogs, setCopiedAllLogs] = useState(false);
  const [savedMemoryStatus, setSavedMemoryStatus] = useState<string | null>(null);
  const [dismissedBugKey, setDismissedBugKey] = useState<string | null>(null);
  const [isAutoFixing, setIsAutoFixing] = useState<boolean>(false);

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([
    { id: "f1", name: "index.html", content: "", language: "html" },
  ]);
  const [activeFileId, setActiveFileId] = useState<string>("f1");
  const [editedCode, setEditedCode] = useState<string>("");
  const [debouncedHtml, setDebouncedHtml] = useState<string>("");
  const codeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastCodeScrollDistanceRef = useRef<number>(0);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    if (activeArtifact?.content) {
      if (activeArtifact.files && activeArtifact.files.length > 0) {
        setProjectFiles(activeArtifact.files as ProjectFile[]);
        const firstHtmlFile = activeArtifact.files.find(f => f.language === "html" || f.name.endsWith(".html")) || activeArtifact.files[0];
        if (firstHtmlFile) {
          setActiveFileId(firstHtmlFile.id);
          setEditedCode(firstHtmlFile.content);
        }
      } else {
        const fileName = activeArtifact.title ? `${activeArtifact.title.toLowerCase().replace(/\s+/g, "_")}.${activeArtifact.type === "html" ? "html" : activeArtifact.type === "svg" ? "svg" : "js"}` : "index.html";
        const initialFiles: ProjectFile[] = [
          { id: "f1", name: fileName, content: activeArtifact.content, language: activeArtifact.type || "html" },
        ];
        setProjectFiles(initialFiles);
        setActiveFileId("f1");
        setEditedCode(activeArtifact.content);
      }
    }
  }, [activeArtifact]);

  useEffect(() => {
    if (!editedCode) return;
    const textarea = codeTextareaRef.current;
    if (!textarea) {
      return;
    }

    const isNearBottom = textarea.scrollHeight - textarea.scrollTop - textarea.clientHeight < 120;
    if (isNearBottom) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [editedCode]);

  const artifact = activeArtifact || {
    title: "Interactive Web Preview",
    type: "html" as const,
    content: `<div style="padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: center; font-family: sans-serif;">
  <h2 style="color: #10b981; margin-bottom: 8px;">Live Preview Sandbox</h2>
  <p style="color: #94a3b8; font-size: 14px;">Live HTML / SVG / Code rendering engine initialized.</p>
  <button style="margin-top: 16px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Action Button</button>
</div>`,
  };

  const currentActiveFile = projectFiles.find((f) => f.id === activeFileId) || projectFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(editedCode || currentActiveFile?.content || artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = currentActiveFile?.name.split(".").pop() || (artifact.type === "html" ? "html" : "txt");
    const blob = new Blob([editedCode || currentActiveFile?.content || artifact.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentActiveFile?.name || `${artifact.title.replace(/\s+/g, "_")}.${ext}`;
    a.click();
  };

  const handleCodeChange = (newCode: string) => {
    setEditedCode(newCode);
    setProjectFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newCode } : f))
    );
    if (activeFileId === "f1" && activeArtifact) {
      setActiveArtifact({
        ...activeArtifact,
        content: newCode,
      });
    }
  };

  const handleCreateFile = () => {
    const name = prompt("Enter new file name (e.g., script.js, style.css, utils.js):");
    if (name && name.trim()) {
      const ext = name.trim().split(".").pop() || "txt";
      const newFile: ProjectFile = {
        id: `f_${Date.now()}`,
        name: name.trim(),
        content: `// New File: ${name.trim()}\n`,
        language: ext,
      };
      setProjectFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      setEditedCode(newFile.content);
    }
  };

  const handleDeleteFile = (fileId: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projectFiles.length <= 1) {
      alert("Cannot delete the last remaining project file.");
      return;
    }
    if (confirm(`Delete file "${fileName}"?`)) {
      setProjectFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (activeFileId === fileId) {
        const remaining = projectFiles.filter((f) => f.id !== fileId);
        setActiveFileId(remaining[0].id);
        setEditedCode(remaining[0].content);
      }
    }
  };

  // Listen for iframe console logs and errors
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "ARTIFACT_CONSOLE_LOG" && event.data?.payload) {
        const item = event.data.payload as ConsoleEntry;
        setConsoleLogs((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.message === item.message && last.level === item.level) {
            return [
              ...prev.slice(0, -1),
              { ...last, count: (last.count || 1) + 1, timestamp: item.timestamp },
            ];
          }
          return [...prev, { ...item, count: 1 }];
        });

        if (item.level === "error") {
          setIsConsoleOpen(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Clear logs on fresh compilation
  useEffect(() => {
    setConsoleLogs([]);
  }, [debouncedHtml]);

  const errorCount = useMemo(() => consoleLogs.filter((l) => l.level === "error").length, [consoleLogs]);
  const warnCount = useMemo(() => consoleLogs.filter((l) => l.level === "warn").length, [consoleLogs]);
  const logCount = useMemo(() => consoleLogs.filter((l) => l.level === "log" || l.level === "info").length, [consoleLogs]);

  const filteredLogs = useMemo(() => {
    return consoleLogs.filter((l) => {
      if (consoleFilter === "error" && l.level !== "error") return false;
      if (consoleFilter === "warn" && l.level !== "warn") return false;
      if (consoleFilter === "log" && l.level !== "log" && l.level !== "info") return false;
      if (consoleSearch.trim()) {
        const q = consoleSearch.toLowerCase();
        return (
          l.message.toLowerCase().includes(q) ||
          (l.filename && l.filename.toLowerCase().includes(q)) ||
          (l.lineno && String(l.lineno).includes(q))
        );
      }
      return true;
    });
  }, [consoleLogs, consoleFilter, consoleSearch]);

  const handleCopyLog = (log: ConsoleEntry) => {
    const text = `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}${log.lineno ? ` (at line ${log.lineno}:${log.colno || 0})` : ""}${log.stack ? `\nStack:\n${log.stack}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const handleCopyAllLogs = () => {
    if (consoleLogs.length === 0) return;
    const text = consoleLogs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] ${l.message}${l.lineno ? ` (at line ${l.lineno}:${l.colno || 0})` : ""}${l.stack ? `\nStack:\n${l.stack}` : ""}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(`=== Console & Error Trace for ${artifact.title} ===\n\n${text}`);
    setCopiedAllLogs(true);
    setTimeout(() => setCopiedAllLogs(false), 2000);
  };

  const handleSaveToMemory = async (targetLog?: ConsoleEntry) => {
    try {
      const summary = targetLog
        ? `Error in ${artifact.title} (${currentActiveFile?.name || "file"}${targetLog.lineno ? ` line ${targetLog.lineno}` : ""}): ${targetLog.message}`
        : `Errors in ${artifact.title}: ${consoleLogs.filter((l) => l.level === "error").map((l) => l.message).join("; ") || "Console inspected: no errors"}`;

      await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `error_${artifact.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          value: summary,
          content: summary,
          isUsed: 1,
        }),
      });

      setSavedMemoryStatus("Saved to Memory!");
      setTimeout(() => setSavedMemoryStatus(null), 3000);
    } catch (err) {
      console.error("Failed to save memory:", err);
      setSavedMemoryStatus("Failed to save");
      setTimeout(() => setSavedMemoryStatus(null), 3000);
    }
  };

  const handleFixWithAI = (targetLog?: ConsoleEntry) => {
    const errorDetails = targetLog
      ? `Error: ${targetLog.message}${targetLog.lineno ? ` at line ${targetLog.lineno}:${targetLog.colno || 0}` : ""}${targetLog.stack ? `\nStack trace:\n${targetLog.stack}` : ""}`
      : consoleLogs
          .filter((l) => l.level === "error")
          .map((l, idx) => `${idx + 1}. [Line ${l.lineno || "?"}] ${l.message}`)
          .join("\n");

    const fileName = currentActiveFile?.name || "index.html";

    const currentCode = currentActiveFile?.content || editedCode || "";
    const runtimeErrorDetails = targetLog
      ? []
      : consoleLogs
          .filter((l) => l.level === "error")
          .map((l) => `${l.message}${l.lineno ? ` (${l.lineno}:${l.colno || 0})` : ""}${l.stack ? `\n${l.stack}` : ""}`);

    const errorTrace = (targetLog ? [errorDetails] : runtimeErrorDetails).filter(Boolean).join("\n");

    let snippetContext = "";
    if (targetLog?.lineno && currentCode) {
      const codeLines = currentCode.split("\n");
      const errLine = targetLog.lineno - 1;
      const start = Math.max(0, errLine - 2);
      const end = Math.min(codeLines.length, errLine + 3);
      if (start < end) {
        snippetContext = `\nFailing snippet around line ${targetLog.lineno}:\n\`\`\`${currentActiveFile.language || "js"}\n${codeLines.slice(start, end).join("\n")}\n\`\`\``;
      }
    }

    const prompt = `Fix runtime error in ${fileName}. Do not rewrite the complete file from scratch.\n\nFull current code:\n\`\`\`${currentActiveFile?.language || "js"}\n${currentCode}\n\`\`\`\n\nConsole errors:\n${errorTrace || "No stack trace captured"}\n\n${snippetContext}\n\nReturn only a surgical patch using this exact format:\n<<<<<<< SEARCH\n[exact existing lines]\n=======\n[replacement lines]\n>>>>>>> REPLACE`;

    // Also auto-save to memory so future conversation has this context
    handleSaveToMemory(targetLog);

    // Set pending prompt with autoSubmit so it immediately triggers the AI to fix it
    setPendingPromptText({
      text: prompt,
      autoSubmit: true,
    });
  };

  // Auto-detection of syntax and runtime bugs upon code finalization
  const detectedBugs = useMemo(() => {
    const issues: { type: "runtime" | "syntax"; message: string; lineno?: number; colno?: number; stack?: string }[] = [];

    // 1. Captured runtime errors from iframe execution
    const errorLogs = consoleLogs.filter((l) => l.level === "error");
    for (const l of errorLogs) {
      if (!issues.some((iss) => iss.message === l.message)) {
        issues.push({
          type: "runtime",
          message: l.message,
          lineno: l.lineno,
          colno: l.colno,
          stack: l.stack,
        });
      }
    }

    // 2. Static syntax check on scripts in currentActiveFile
    const code = currentActiveFile?.content || editedCode || "";
    if (code) {
      const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = scriptRegex.exec(code)) !== null) {
        const jsText = m[1];
        try {
          new Function(jsText);
        } catch (err: any) {
          const msg = err.message || "Syntax error in script";
          if (!issues.some((iss) => iss.message === msg)) {
            issues.push({
              type: "syntax",
              message: msg,
            });
          }
        }
      }
    }

    return issues;
  }, [consoleLogs, currentActiveFile?.content, editedCode]);

  const activeBug = detectedBugs[0];
  const activeBugKey = activeBug ? `${activeBug.message}_${activeBug.lineno || 0}` : null;
  const showBugPrompt = Boolean(activeBug && dismissedBugKey !== activeBugKey);

  const handleProceedFixBug = () => {
    if (!activeBug) return;
    setIsAutoFixing(true);
    setDismissedBugKey(activeBugKey);

    const targetLog: ConsoleEntry = {
      id: `err_${Date.now()}`,
      level: "error",
      message: activeBug.message,
      lineno: activeBug.lineno,
      colno: activeBug.colno,
      stack: activeBug.stack,
      timestamp: Date.now(),
      count: 1,
    };

    handleFixWithAI(targetLog);

    setTimeout(() => {
      setIsAutoFixing(false);
    }, 2500);
  };

  // Parsed DOM elements for Elements Inspector tab
  const parsedElements = useMemo(() => {
    const html = currentActiveFile?.content || "";
    const regex = /<([a-zA-Z0-9-]+)([^>]*)>(?:([\s\S]*?)<\/\1>)?/g;
    const elements: { tag: string; id?: string; className?: string; text?: string }[] = [];
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null && count < 60) {
      const tag = match[1].toLowerCase();
      if (["html", "head", "body", "meta", "link", "title", "style"].includes(tag)) continue;
      const attrs = match[2];
      const idMatch = attrs.match(/id=["']([^"']+)["']/i);
      const classMatch = attrs.match(/class(?:Name)?=["']([^"']+)["']/i);
      const text = match[3] ? match[3].replace(/<[^>]*>/g, "").trim().slice(0, 40) : undefined;
      elements.push({
        tag,
        id: idMatch ? idMatch[1] : undefined,
        className: classMatch ? classMatch[1] : undefined,
        text: text && text.length > 0 ? text : undefined,
      });
      count++;
    }
    return elements;
  }, [currentActiveFile?.content]);

  const isRenderable = true;

  const buildHtmlDocument = () => {
    if (projectFiles.length === 0) {
      return `<!DOCTYPE html><html><body style="background:#0f172a; color:#94a3b8; font-family:sans-serif; padding:24px; text-align:center;">No previewable code content</body></html>`;
    }

    const mainFile = projectFiles.find(f => f.language === "html" || f.name.endsWith(".html")) ||
                     projectFiles.find(f => f.language === "jsx" || f.language === "tsx" || (f.language === "javascript" && f.content.includes("import React"))) ||
                     projectFiles[0];

    if (!mainFile) return "";

    let documentHtml = (mainFile.id === activeFileId && editedCode.trim()) ? editedCode : mainFile.content;

    let injectedCSS = "";
    let injectedJS = "";
    
    projectFiles.forEach(f => {
      if (f.id === mainFile.id) return; 
      
      const fileContent = f.id === activeFileId ? editedCode : f.content;
      
      if (f.language === "css" || f.name.endsWith(".css")) {
         injectedCSS += `\n<style>\n/* ${f.name} */\n${fileContent}\n</style>\n`;
      } else if (f.language === "javascript" || f.language === "js" || f.name.endsWith(".js") || f.language === "jsx" || f.language === "tsx") {
         const isBackend = f.name.includes("server") || f.name.includes("api") || f.content.includes("require(");
         if (!isBackend) {
           injectedJS += `\n<script>\n/* ${f.name} */\ntry {\n${fileContent}\n} catch(err) { console.error('Error in ${f.name}:', err); }\n</script>\n`;
         }
      }
    });

    // Check if code is React / JSX component
    const isReactJSX =
      documentHtml.includes("import React") ||
      documentHtml.includes("export default") ||
      documentHtml.includes("useState(") ||
      documentHtml.includes("useEffect(") ||
      (documentHtml.includes("function App") && !documentHtml.includes("<!DOCTYPE"));

    const consoleInterceptorScript = `
  <script>
    (function() {
      function sendToParent(level, args, extra) {
        try {
          var msg = Array.prototype.slice.call(args).map(function(a) {
            if (typeof a === 'object' && a !== null) {
              try { return JSON.stringify(a); } catch(e) { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({
            type: 'ARTIFACT_CONSOLE_LOG',
            payload: {
              id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
              level: level,
              message: msg,
              lineno: extra && extra.lineno,
              colno: extra && extra.colno,
              filename: extra && extra.filename,
              stack: extra && extra.stack,
              timestamp: Date.now()
            }
          }, '*');
        } catch(e) {}
      }

      var origLog = console.log;
      var origWarn = console.warn;
      var origError = console.error;
      var origInfo = console.info;

      console.log = function() {
        sendToParent('log', arguments);
        if (origLog) origLog.apply(console, arguments);
      };
      console.warn = function() {
        sendToParent('warn', arguments);
        if (origWarn) origWarn.apply(console, arguments);
      };
      console.error = function() {
        sendToParent('error', arguments);
        if (origError) origError.apply(console, arguments);
      };
      console.info = function() {
        sendToParent('info', arguments);
        if (origInfo) origInfo.apply(console, arguments);
      };

      window.addEventListener('error', function(e) {
        sendToParent('error', [e.message || 'Script error'], {
          lineno: e.lineno,
          colno: e.colno,
          filename: e.filename,
          stack: e.error && e.error.stack ? e.error.stack : ''
        });
      });

      window.addEventListener('unhandledrejection', function(e) {
        var reason = e.reason;
        var msg = reason && reason.message ? reason.message : String(reason);
        sendToParent('error', ['Unhandled Promise Rejection: ' + msg], {
          stack: reason && reason.stack ? reason.stack : ''
        });
      });
    })();
  </script>`;

    if (isReactJSX) {
      // Strip import statements and export keywords for browser Babel execution
      const cleanReactCode = documentHtml
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, "")
        .replace(/import\s+['"].*?['"];?/g, "")
        .replace(/export\s+default\s+/g, "const App = ")
        .replace(/export\s+const\s+/g, "const ");

      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${consoleInterceptorScript}
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #f8fafc; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    html { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f8fafc; background: #ffffff; }
  </style>${injectedCSS}
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      const { useState, useEffect, useRef, useMemo, useCallback } = React;
      ${cleanReactCode}
      const RootComp = typeof App !== 'undefined' ? App : (typeof Component !== 'undefined' ? Component : null);
      if (RootComp) {
        ReactDOM.createRoot(document.getElementById('root')).render(<RootComp />);
      } else {
        document.getElementById('root').innerHTML = '<div style="padding:24px; color:#f59e0b; font-family:sans-serif;">React component compiled cleanly. (Define App component to render)</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div style="color:#ef4444; padding:24px; font-family:monospace; background:#1e1012; border-radius:8px;"><strong>React Execution Error:</strong><pre style="margin-top:8px; white-space:pre-wrap;">' + err.message + '</pre></div>';
    }
  </script>
  ${injectedJS}
</body>
</html>`;
    }

    // Standard HTML / CSS / JS / SVG:
    // Convert className="..." to class="..." for pure HTML elements so Tailwind classes apply
    if (!documentHtml.includes("import React")) {
      documentHtml = documentHtml.replace(/className=(["'])(.*?)\1/g, 'class=$1$2$1');
    }

    // Remove broken local file links (e.g. href="style.css" or src="script.js") that cause 404 GET errors
    documentHtml = documentHtml
      .replace(/<link[^>]*href=["'](?!https?:\/\/|\/\/|data:)[^"']*["'][^>]*>/gi, "")
      .replace(/<script[^>]*src=["'](?!https?:\/\/|\/\/|data:)[^"']*["'][^>]*><\/script>/gi, "");

    // Auto-repair common LLM typos in JS code
    documentHtml = documentHtml
      .replace(/(\b[a-zA-Z0-9_.]+\s*<\s*)\.splice\(/g, '$10) bullets.splice(')
      .replace(/(\b[a-zA-Z0-9_.]+\s*>\s*)\.splice\(/g, '$10) bullets.splice(')
      .replace(/case\s+['"]?([a-zA-Z0-9_-]+)['"]?\s*=\s*(['"][^'"]+['"];)/g, "case '$1': osc.type = $2")
      .replace(/case\s+['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*(['"](?:triangle|sine|square|sawtooth)['"];)/g, "case '$1': osc.type = $2")
      .replace(/if\s*\(([^)]*player\.x\s*<\s*[^)]*player\.width)\s+player\.speed;/g, 'if ($1) player.x += player.speed;')
      .replace(/gain\.connect\(ctx\s+const/g, 'gain.connect(ctx.destination); const')
      .replace(/\.addEventListener\((['"][^'"]+['"]),\s*([a-zA-Z0-9_$]+\s*=\s*!?[a-zA-Z0-9_$]+;)/g, ".addEventListener($1, () => {\n    $2")
      .replace(/\.stop\(now2\);/g, '.stop(now + 0.2);');

    // If main code is raw CSS or contains CSS style blocks without HTML markup, wrap inside <style> & provide container
    const isPureCss = (documentHtml.includes("{") && documentHtml.includes("}")) &&
                      !documentHtml.includes("<body") &&
                      !documentHtml.includes("<html") &&
                      !documentHtml.includes("<div") &&
                      !documentHtml.includes("<main") &&
                      !documentHtml.includes("const ") &&
                      !documentHtml.includes("function ");

    if (isPureCss) {
      injectedCSS += `\n<style>\n${documentHtml}\n</style>\n`;
      documentHtml = `<div class="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white font-sans text-center">
        <div class="card-3d glassmorphism p-8 rounded-3xl max-w-lg border border-white/20 shadow-2xl">
          <h1 class="text-3xl font-extrabold gradient-text mb-3">Interactive App Preview</h1>
          <p class="text-slate-300 text-sm mb-6">Custom 3D & Visual UI Styles Loaded Successfully.</p>
          <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 font-bold text-white shadow-lg hover:scale-105 transition transform cursor-pointer">Launch App</button>
        </div>
      </div>`;
    }

    // If main code is pure JavaScript / 3D game logic (e.g. Three.js, canvas, WebGL) without HTML tags, wrap in <script> and supply 3D canvas container
    const isPureJs = !documentHtml.includes("<div") &&
                     !documentHtml.includes("<html") &&
                     !documentHtml.includes("<body") &&
                     !documentHtml.includes("<canvas") &&
                     (documentHtml.includes("const ") ||
                      documentHtml.includes("let ") ||
                      documentHtml.includes("function ") ||
                      documentHtml.includes("THREE.") ||
                      documentHtml.includes("document.get") ||
                      documentHtml.includes("/*"));

    if (isPureJs) {
      const jsCode = documentHtml;
      documentHtml = `<div id="app" style="position:fixed; inset:0; width:100vw; height:100vh; overflow:hidden; background:#050508;">
        <canvas id="gameCanvas" style="width:100%; height:100%; display:block; position:absolute; inset:0; z-index:0;"></canvas>
        <div id="hud" style="position:relative; z-index:10; padding:20px; color:white; font-family:sans-serif; pointer-events:none;">
          <div style="background:rgba(255,255,255,0.08); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.15); padding:16px 24px; border-radius:16px; display:inline-block; pointer-events:auto; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <h2 style="margin:0 0 4px 0; font-size:18px; color:#10b981;">🎮 3D WebGL Live Engine</h2>
            <p style="margin:0; font-size:12px; color:#cbd5e1;">Interactive 3D Game / Visual Canvas Loaded</p>
          </div>
        </div>
      </div>
      <script>
        window.addEventListener('DOMContentLoaded', () => {
          try {
            ${jsCode}
          } catch(err) {
            console.error("3D JS Execution Error:", err);
            const hud = document.getElementById('hud');
            if (hud) {
              hud.innerHTML += '<div style="color:#ef4444; background:#1e1012; border:1px solid #f87171; padding:12px; border-radius:8px; margin-top:10px; font-mono; font-size:12px;"><strong>Script Error:</strong> ' + err.message + '</div>';
            }
          }
        });
      </script>`;
    }

    const cdnHeadElements = `
  ${consoleInterceptorScript}
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap">
  <script>
    window.addEventListener('error', function(e) {
      if (document.getElementById('__error_toast__')) return;
      var el = document.createElement('div');
      el.id = '__error_toast__';
      el.style.cssText = 'position:fixed;bottom:14px;left:14px;right:14px;background:#7f1d1d;color:#fee2e2;padding:10px 14px;border-radius:10px;font-family:monospace;font-size:12px;z-index:999999;box-shadow:0 8px 24px rgba(0,0,0,0.6);border:1px solid #ef4444;display:flex;align-items:center;justify-content:space-between;';
      el.innerHTML = '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><strong>Game Script Notice:</strong> ' + (e.message || 'Error running script') + (e.lineno ? ' (Line ' + e.lineno + ')' : '') + '</span><button onclick="this.parentElement.remove()" style="background:#b91c1c;border:none;color:#fff;border-radius:6px;padding:3px 8px;cursor:pointer;margin-left:8px;flex-shrink:0;">✕</button>';
      if (document.body) document.body.appendChild(el);
    });
  </script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; font-family: 'Poppins', 'Inter', system-ui, -apple-system, sans-serif; overflow-x: hidden; background: #0f172a; color: #f8fafc; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #1e293b; }
    ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #64748b; }
  </style>${injectedCSS}`;

    if (injectedJS) {
      if (documentHtml.includes("</body>")) {
        documentHtml = documentHtml.replace("</body>", `${injectedJS}\n</body>`);
      } else {
        documentHtml += `\n${injectedJS}`;
      }
    }

    if (documentHtml.includes("<head>")) {
      documentHtml = documentHtml.replace("<head>", `<head>${cdnHeadElements}`);
    } else if (documentHtml.includes("<!DOCTYPE") || documentHtml.includes("<html")) {
      documentHtml = documentHtml.replace(/<html[^>]*>/i, `$&<head>${cdnHeadElements}</head>`);
    } else {
      documentHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${cdnHeadElements}
</head>
<body>
  ${documentHtml}
</body>
</html>`;
    }

    return documentHtml;
  };

  const currentHtmlDoc = useMemo(() => buildHtmlDocument(), [projectFiles, activeFileId, editedCode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(currentHtmlDoc);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentHtmlDoc]);

  if (!isArtifactsOpen) return null;

  return (
    <div
      className={`h-full border-l border-white/5 bg-[#0f0f0f] flex flex-col relative z-20 select-none transition-all duration-300 shadow-2xl min-w-0 ${
        isMaximized
          ? "absolute inset-0 z-50"
          : "w-full md:w-1/2 lg:w-1/2 min-w-[320px] max-w-[55%] flex-shrink-0"
      }`}
    >
      {/* Unified Top Header & Controls */}
      <div className="flex flex-col bg-[#141414] border-b border-white/5">
        {/* Top Row: Title and Window Controls */}
        <div className="h-12 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <Sparkles className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-white truncate max-w-[200px] lg:max-w-[300px]">{artifact.title}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                {artifact.type}
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                {projectFiles.length} file{projectFiles.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
              title={isMaximized ? "Restore view" : "Maximize view"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={toggleArtifacts}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Tabs and Actions */}
        <div className="h-12 px-4 flex items-center justify-between border-t border-white/5 bg-[#121212]">
          {/* Left: Code vs Preview Tabs (Code first, as user requested) */}
          <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "code"
                  ? "bg-[#252525] text-white shadow-sm border border-white/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Code className="w-3.5 h-3.5 text-red-400" />
              <span>Code</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "preview"
                  ? "bg-[#252525] text-white shadow-sm border border-white/10 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Preview</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {activeTab === "preview" && (
              <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 mr-2">
                <button
                  type="button"
                  onClick={() => setViewDevice("desktop")}
                  title="Desktop View (100%)"
                  className={`p-1.5 rounded-md transition ${viewDevice === "desktop" ? "bg-[#252525] text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDevice("tablet")}
                  title="Tablet View (768px)"
                  className={`p-1.5 rounded-md transition ${viewDevice === "tablet" ? "bg-[#252525] text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDevice("mobile")}
                  title="Mobile View (375px)"
                  className={`p-1.5 rounded-md transition ${viewDevice === "mobile" ? "bg-[#252525] text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setIsFilesSidebarOpen(!isFilesSidebarOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                isFilesSidebarOpen ? "bg-[#252525] text-white border-white/10" : "bg-transparent text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Files</span>
            </button>

            <div className="w-px h-4 bg-white/10 mx-1"></div>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Detection of Bugs upon Code Finalization with Confirmation Option */}
      {showBugPrompt && activeBug && (
        <div className="bg-[#1e1012] border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200 backdrop-blur-md z-30 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 animate-pulse border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-amber-200 flex items-center gap-2 truncate">
                <span>Bug Auto-Detected: {activeBug.type === "syntax" ? "Syntax Error" : "Runtime Glitch"}</span>
                {activeBug.lineno && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-mono font-bold">
                    line {activeBug.lineno}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-300 truncate font-mono mt-0.5">
                {activeBug.message}
              </div>
              <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                Is error ko auto-fix karoon? (Proceed with fix?)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleProceedFixBug}
              disabled={isAutoFixing}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAutoFixing ? "Fixing..." : "Yes, Fix Bug"}</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissedBugKey(activeBugKey)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Workspace Body with Collapsible Files List Sub-Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Project Files List Sub-Sidebar */}
        {isFilesSidebarOpen && (
          <div className="w-56 bg-[#161616] border-r border-white/5 flex flex-col p-3 space-y-2 select-none flex-shrink-0 animate-in fade-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-1 py-1.5 text-xs font-medium text-slate-400 border-b border-white/5 mb-2">
              <span className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-slate-300" />
                <span>Files</span>
              </span>
              <button
                type="button"
                onClick={handleCreateFile}
                title="Create New File"
                className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {projectFiles.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                  <button
                    key={file.id}
                    onClick={() => {
                      setActiveFileId(file.id);
                      setEditedCode(file.content);
                      setActiveTab("code");
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] transition group border border-transparent ${
                      isActive
                        ? "bg-[#252525] text-white font-medium border-white/5 shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <FileCode className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-red-400" : "text-slate-500"}`} />
                      <span className="truncate">{file.name}</span>
                    </div>

                    {projectFiles.length > 1 && (
                      <span
                        onClick={(e) => handleDeleteFile(file.id, file.name, e)}
                        title="Delete File"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:bg-white/10 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Sandbox / Live Code Editor Area */}
        <div className="flex-1 overflow-auto bg-[#0a0a0a] flex flex-col relative min-w-0">
          {/* 1. PREVIEW CONTAINER (Always mounted to eliminate tab-switching blinking/iframe re-initialization) */}
          <div className={`flex-1 flex flex-col h-full overflow-hidden w-full ${activeTab === "preview" ? "flex" : "hidden"}`}>
            {(() => {
              const mainFile = projectFiles.find(f => f.language === "html" || f.name.endsWith(".html")) ||
                               projectFiles.find(f => f.language === "jsx" || f.language === "tsx" || (f.language === "javascript" && f.content.includes("import React"))) ||
                               projectFiles[0];
                               
              if (!mainFile) return null;
              
              const lang = (mainFile.language || "").toLowerCase();
              const mainCodeText = mainFile.id === activeFileId ? editedCode : mainFile.content;

              const isPureBackendOnly = (lang === "python" || lang === "py" || lang === "sql" || lang === "cpp" || lang === "c") &&
                                        !mainCodeText.includes("<div") &&
                                        !mainCodeText.includes("<html") &&
                                        !mainCodeText.includes("<!DOCTYPE");

              const activeHtmlSource = debouncedHtml || currentHtmlDoc;

              if (!isPureBackendOnly) {
                return viewDevice === "mobile" ? (
                  <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#0a0a0a]">
                    <div className="w-[375px] h-[667px] mx-auto rounded-[36px] border-[12px] border-[#1a1a1a] shadow-2xl overflow-hidden bg-[#0f172a] relative flex flex-col">
                      <div className="w-32 h-6 bg-[#1a1a1a] rounded-b-2xl mx-auto flex-shrink-0 absolute top-0 left-1/2 -translate-x-1/2 z-10" />
                      <iframe
                        srcDoc={activeHtmlSource}
                        className="w-full h-full border-none bg-[#0f172a]"
                        allow="autoplay"
                        sandbox="allow-scripts allow-modals allow-forms allow-popups"
                      />
                    </div>
                  </div>
                ) : viewDevice === "tablet" ? (
                  <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#0a0a0a]">
                    <div className="w-[768px] max-w-full h-[1024px] max-h-[85vh] mx-auto rounded-[24px] border-[12px] border-[#1a1a1a] shadow-2xl overflow-hidden bg-[#0f172a] relative flex flex-col">
                      <div className="w-4 h-4 bg-[#1a1a1a] rounded-full absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                      <iframe
                        srcDoc={activeHtmlSource}
                        className="w-full h-full border-none bg-[#0f172a]"
                        allow="autoplay"
                        sandbox="allow-scripts allow-modals allow-forms allow-popups"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 bg-[#0f172a] h-full w-full">
                    <iframe
                      srcDoc={activeHtmlSource}
                      className="w-full h-full border-none bg-[#0f172a]"
                      allow="autoplay"
                      sandbox="allow-scripts allow-modals allow-forms allow-popups"
                    />
                  </div>
                );
              }

              // Non-Web File Preview Card (Python, C++, JSON, SQL, etc.)
              return (
                <div className="h-full flex flex-col gap-3">
                  <div className="p-3.5 m-4 rounded-xl bg-[#1a1a1a] border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                      <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        {lang.toUpperCase()} Code File — Web UI preview unavailable for back-end / script files.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("code")}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-black text-xs font-semibold transition flex-shrink-0"
                    >
                      Edit Code
                    </button>
                  </div>
                  <pre className="flex-1 p-4 m-4 mt-0 rounded-xl bg-[#121212] border border-white/10 font-mono text-xs text-slate-300 overflow-auto whitespace-pre leading-relaxed shadow-inner custom-scrollbar">
                    <code>{mainCodeText}</code>
                  </pre>
                </div>
              );
            })()}
          </div>

          {/* 2. CODE EDITOR CONTAINER (Kept mounted in DOM for instant 0ms switching and smooth streaming) */}
          <div className={`flex-1 flex flex-col h-full overflow-hidden w-full bg-[#0a0a0a] ${activeTab === "code" ? "flex" : "hidden"}`}>
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#121212] border-b border-white/5 text-[11px] text-slate-400 flex-shrink-0">
              <span className="font-mono flex items-center gap-2 text-slate-300">
                <Code className="w-4 h-4 text-red-400" />
                Editing: {currentActiveFile.name}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCodeChange(artifact.content)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition border border-white/5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  Live Code
                </span>
              </div>
            </div>
            <textarea
              ref={codeTextareaRef}
              value={editedCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full flex-1 p-5 bg-[#0a0a0a] font-mono text-[13px] text-slate-300 focus:outline-none focus:ring-inset focus:ring-1 focus:ring-white/10 leading-relaxed resize-none selection:bg-white/20 custom-scrollbar"
              placeholder="Streaming and editable code content..."
            />
          </div>

          {/* 3. DOCKABLE CONSOLE & INSPECT ELEMENT DRAWER */}
          <div className="flex flex-col border-t border-white/10 bg-[#111111] flex-shrink-0 z-30 transition-all duration-200">
            {/* Drawer Header / Bar */}
            <div
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="h-9 px-3 flex items-center justify-between bg-[#141414] hover:bg-[#181818] cursor-pointer select-none border-b border-white/5 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-red-400" />
                  <span>Inspect & Console</span>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1 ml-2">
                  {errorCount > 0 ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      {errorCount} {errorCount === 1 ? "Error" : "Errors"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <Check className="w-2.5 h-2.5" />
                      Clean
                    </span>
                  )}

                  {warnCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-500/20 border border-amber-500/30">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {warnCount}
                    </span>
                  )}

                  {logCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                      <Info className="w-2.5 h-2.5" />
                      {logCount}
                    </span>
                  )}
                </div>

                {savedMemoryStatus && (
                  <span className="ml-2 text-[10px] text-emerald-400 font-medium animate-in fade-in flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {savedMemoryStatus}
                  </span>
                )}
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {errorCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleFixWithAI()}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-medium transition shadow-sm cursor-pointer"
                    title="Send error trace to AI for automatic repair"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Fix with AI</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveToMemory()}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition border border-white/5 cursor-pointer"
                  title="Save errors into AI memory so the model remembers past bugs"
                >
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span className="hidden sm:inline">Memory</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllLogs}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition border border-white/5 cursor-pointer"
                  title="Copy complete console & error trace"
                >
                  {copiedAllLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden sm:inline">{copiedAllLogs ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Clear console"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition ml-1 cursor-pointer"
                  title={isConsoleOpen ? "Collapse drawer" : "Expand drawer"}
                >
                  {isConsoleOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Drawer Body (Expandable) */}
            {isConsoleOpen && (
              <div className="h-60 flex flex-col bg-[#0b0b0b] overflow-hidden">
                {/* Sub-bar: Tabs & Filters */}
                <div className="h-8 px-3 flex items-center justify-between bg-[#121212] border-b border-white/5 text-[11px]">
                  {/* Left: Console vs Elements */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-black/40 p-0.5 rounded border border-white/5">
                      <button
                        type="button"
                        onClick={() => setConsoleTab("console")}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          consoleTab === "console" ? "bg-[#252525] text-white font-medium" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Console ({consoleLogs.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsoleTab("elements")}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          consoleTab === "elements" ? "bg-[#252525] text-white font-medium" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Elements ({parsedElements.length})
                      </button>
                    </div>

                    {consoleTab === "console" && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setConsoleFilter("all")}
                          className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                            consoleFilter === "all" ? "bg-white/10 text-white font-medium" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsoleFilter("error")}
                          className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                            consoleFilter === "error" ? "bg-red-500/20 text-red-300 font-medium" : "text-slate-500 hover:text-red-400"
                          }`}
                        >
                          Errors ({errorCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsoleFilter("warn")}
                          className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                            consoleFilter === "warn" ? "bg-amber-500/20 text-amber-300 font-medium" : "text-slate-500 hover:text-amber-400"
                          }`}
                        >
                          Warnings ({warnCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsoleFilter("log")}
                          className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${
                            consoleFilter === "log" ? "bg-blue-500/20 text-blue-300 font-medium" : "text-slate-500 hover:text-blue-400"
                          }`}
                        >
                          Logs ({logCount})
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Search Filter */}
                  <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    <Search className="w-3 h-3 text-slate-500" />
                    <input
                      type="text"
                      value={consoleSearch}
                      onChange={(e) => setConsoleSearch(e.target.value)}
                      placeholder="Filter trace..."
                      className="bg-transparent text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none w-24 sm:w-36 font-mono"
                    />
                  </div>
                </div>

                {/* Main Drawer List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] p-2 space-y-1">
                  {consoleTab === "console" ? (
                    filteredLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                        <Terminal className="w-6 h-6 mb-2 text-slate-600" />
                        <span>No {consoleFilter !== "all" ? consoleFilter : ""} logs or errors captured.</span>
                        <span className="text-[10px] text-slate-600 mt-1">Interception active for console.log, console.error, and runtime errors.</span>
                      </div>
                    ) : (
                      filteredLogs.map((log) => {
                        const isError = log.level === "error";
                        const isWarn = log.level === "warn";
                        return (
                          <div
                            key={log.id}
                            className={`p-2 rounded border flex flex-col gap-1 transition ${
                              isError
                                ? "bg-red-950/20 border-red-900/40 text-red-300"
                                : isWarn
                                ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                                : "bg-[#141414] border-white/5 text-slate-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                <span className="mt-0.5 flex-shrink-0">
                                  {isError ? (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                  ) : isWarn ? (
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  ) : (
                                    <Info className="w-3.5 h-3.5 text-blue-400" />
                                  )}
                                </span>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-slate-500">
                                      {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    {log.count > 1 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/10 text-white">
                                        {log.count}
                                      </span>
                                    )}
                                    {log.lineno && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                                        line {log.lineno}{log.colno ? `:${log.colno}` : ""}
                                      </span>
                                    )}
                                  </div>
                                  <span className="break-words whitespace-pre-wrap select-text leading-relaxed mt-0.5">
                                    {log.message}
                                  </span>
                                  {log.stack && (
                                    <details className="mt-1 text-[10px] text-slate-400">
                                      <summary className="cursor-pointer hover:text-slate-200">Show stack trace</summary>
                                      <pre className="mt-1 p-1.5 rounded bg-black/60 border border-white/5 overflow-x-auto text-[10px] text-slate-400 leading-normal">
                                        {log.stack}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              </div>

                              {/* Entry Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isError && (
                                  <button
                                    type="button"
                                    onClick={() => handleFixWithAI(log)}
                                    className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                                    title="Ask AI to repair this specific error"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Fix</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopyLog(log)}
                                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                                  title="Copy log entry"
                                >
                                  {copiedLogId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : (
                    /* Elements Tree Tab */
                    parsedElements.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                        <Layers className="w-6 h-6 mb-2 text-slate-600" />
                        <span>No distinct DOM elements found in active file.</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 mb-2 px-1">
                          Detected HTML & Interactive Elements Hierarchy ({parsedElements.length} elements):
                        </div>
                        {parsedElements.map((el, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 rounded bg-[#141414] hover:bg-[#1c1c1c] border border-white/5 flex items-center justify-between text-[11px] group transition"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-red-400 font-bold">&lt;{el.tag}&gt;</span>
                              {el.id && <span className="text-amber-400">#{el.id}</span>}
                              {el.className && (
                                <span className="text-blue-400 truncate max-w-[200px]">.{el.className.split(" ")[0]}</span>
                              )}
                              {el.text && <span className="text-slate-400 truncate max-w-[150px]">"{el.text}"</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `<${el.tag}${el.id ? ` id="${el.id}"` : ""}${el.className ? ` class="${el.className}"` : ""}>`
                                );
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                              title="Copy element tag"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
