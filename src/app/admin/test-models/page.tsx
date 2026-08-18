'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Sparkles,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Cpu,
  Key,
  Info,
  ArrowDownRight,
  TerminalSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Brain,
  Eye,
  Film,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Sliders,
  Swords,
  Code,
  Download,
  Terminal,
  RotateCcw,
  CheckCheck
} from 'lucide-react';

interface TestModel {
  id: string;
  name: string;
  provider: string;
  icon?: string;
  caps?: string[];
  text?: boolean;
  reasoning?: boolean;
  vision?: boolean;
  audio?: boolean;
  image?: boolean;
  video?: boolean;
  inputPrice?: string;
  outputPrice?: string;
  contextWindow?: string;
  access?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
  thinking?: string;
  error?: boolean;
  latency?: number;
  modelId?: string;
}

type CapabilityType = 'all' | 'text' | 'reasoning' | 'vision' | 'audio' | 'image' | 'video';
type ViewMode = 'chat' | 'arena';

const PRESET_SYSTEM_MESSAGES = [
  { label: 'General', text: 'You are a helpful AI assistant. Respond as clearly and concisely as possible.' },
  { label: 'Code', text: 'You are a senior software engineer. Provide clean, production-ready code with concise explanations.' },
  { label: 'Reasoning', text: 'You are an advanced analytical reasoner. Carefully think step-by-step, verify edge cases, and show your structured reasoning.' },
  { label: 'Vision', text: 'You are an expert visual analysis assistant. Describe images accurately, detect subtle details, and interpret visual context thoroughly.' },
  { label: 'Urdu', text: 'Aap ek behtareen aur madadgar AI assistant hain. Roman Urdu aur Urdu mein asan aur wazeh jawab dein.' },
];

const BENCHMARK_PROMPTS = [
  { label: '🧮 9.11 vs 9.9', prompt: 'Which is bigger: 9.11 or 9.9? Think step by step and explain why.' },
  { label: '💻 TS Debounce', prompt: 'Write a clean TypeScript debounce function with generic types and cancellation support.' },
  { label: '🌐 Roman Urdu', prompt: 'Mujhe AI aur insani mustaqbil par ek sabaq aamoz mukhtasar kahani sunao.' },
];

export default function TestModelsPage() {
  const [models, setModels] = useState<TestModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');

  // Primary model selection
  const [selectedModel, setSelectedModel] = useState<string>('');
  // Arena secondary model
  const [arenaModelB, setArenaModelB] = useState<string>('');

  const [activeCapFilter, setActiveCapFilter] = useState<CapabilityType>('all');
  const [systemMessage, setSystemMessage] = useState(PRESET_SYSTEM_MESSAGES[0].text);
  const [userMessage, setUserMessage] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [arenaMessagesB, setArenaMessagesB] = useState<ChatMessage[]>([]);

  // Hyperparameters
  const [showParams, setShowParams] = useState(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(1.0);
  const [maxTokens, setMaxTokens] = useState<number>(2048);

  // Inspector & Modals
  const [showInspector, setShowInspector] = useState(false);
  const [lastRawPayload, setLastRawPayload] = useState<any>(null);
  const [lastRawResponse, setLastRawResponse] = useState<any>(null);

  // State flags
  const [sending, setSending] = useState(false);
  const [sendingArenaB, setSendingArenaB] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number>(-1);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const pushLog = (type: string, message: string, details?: any, sessionId?: string) => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/dev-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify({ type, component: 'Frontend UI', message, details, sessionId }),
    }).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/public/providers')
      .then(res => res.json())
      .then(data => {
        const rawProviders = Array.isArray(data) ? data : (data as any)?.providers || [];
        const all: TestModel[] = [];
        for (const p of rawProviders) {
          for (const m of p.models || []) {
            if (!m.showOnLandingPage && m.showOnLandingPage !== undefined) continue;

            const nameLower = (m.name || m.id || '').toLowerCase();
            const idLower = (m.id || m.originalId || '').toLowerCase();

            const isReasoning = !!m.reasoning || m.caps?.includes('reasoning') || idLower.includes('r1') || idLower.includes('reasoning') || idLower.includes('nemotron');
            const isVision = !!m.vision || m.caps?.includes('vision') || idLower.includes('vl') || idLower.includes('vision') || idLower.includes('4o') || idLower.includes('flash') || idLower.includes('gemini') || idLower.includes('sonnet');
            const isAudio = !!m.audio || m.caps?.includes('audio') || m.caps?.includes('voice') || idLower.includes('audio') || idLower.includes('voice');
            const isImage = !!m.image || m.caps?.includes('image') || idLower.includes('dall-e') || idLower.includes('flux') || idLower.includes('sd');
            const isVideo = !!m.video || m.caps?.includes('video') || idLower.includes('sora') || idLower.includes('video');

            all.push({
              id: m.id || m.originalId || '',
              name: m.name || m.id,
              provider: p.name || '',
              icon: m.icon || p.icon,
              caps: Array.isArray(m.caps) ? m.caps : undefined,
              text: m.text !== false,
              reasoning: isReasoning,
              vision: isVision,
              audio: isAudio,
              image: isImage,
              video: isVideo,
              inputPrice: m.inputPrice,
              outputPrice: m.outputPrice,
              contextWindow: m.contextWindow,
              access: m.access,
            });
          }
        }
        setModels(all);
        if (all.length > 0) {
          setSelectedModel(all[0].id);
          if (all.length > 1) setArenaModelB(all[1].id);
          pushLog('INFO', `AI models fetched (${all.length})`, { models: all });
        }
        setLoadingModels(false);
      })
      .catch(() => setLoadingModels(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Handle clipboard paste for images (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setAttachedImages(prev => [...prev, String(reader.result)]);
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Voice Input Speech Recognition Setup
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserMessage(prev => {
          const base = prev.trim();
          return base ? `${base} ${transcript}` : transcript;
        });
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text-To-Speech Playback
  const speakText = (index: number, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setAttachedImages(prev => [...prev, String(reader.result)]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const parseThinkingAndContent = (rawContent: string): { thinking?: string; cleanContent: string } => {
    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      const thinking = thinkMatch[1].trim();
      const cleanContent = rawContent.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      return { thinking, cleanContent };
    }
    return { cleanContent: rawContent };
  };

  // Single model execution helper
  const executeModelRequest = async (targetModel: string, customMessages: any[]) => {
    const token = localStorage.getItem('admin_token');
    const sessionId = crypto.randomUUID();
    const payload = {
      model: targetModel,
      messages: customMessages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream: false,
    };
    setLastRawPayload(payload);

    const started = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const res = await fetch('/api/admin/test-model', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
        'x-session-id': sessionId,
      },
      body: JSON.stringify(payload),
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    const elapsed = Math.round(performance.now() - started);
    setLastRawResponse(data);

    if (!res.ok) {
      const raw = data?.error?.message || data?.error?.message === '' ? data?.error?.message : data?.error;
      const msg = typeof raw === 'string' ? raw : `Request failed (${res.status})`;
      throw new Error(msg);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (content === undefined || content === null) {
      throw new Error('Model returned an empty response.');
    }

    return { content: String(content), elapsed, rawData: data };
  };

  // Send message handler (Single & Arena battle)
  const sendMessage = async (retryText?: string) => {
    const textToSend = (retryText !== undefined ? retryText : userMessage).trim();
    if ((!textToSend && attachedImages.length === 0) || !selectedModel || sending) return;

    const validHistoryA = messages.filter(m => !m.error && m.role !== 'system');
    const convoA: any[] = [
      ...(systemMessage.trim() ? [{ role: 'system' as const, content: systemMessage.trim() }] : []),
      ...validHistoryA.map(m => (m.images?.length ? { role: m.role, content: m.content, images: m.images } : { role: m.role, content: m.content })),
      { role: 'user' as const, content: textToSend, ...(attachedImages.length > 0 ? { images: attachedImages } : {}) },
    ];

    if (retryText === undefined) {
      setMessages(prev => [...prev, { role: 'user', content: textToSend, images: attachedImages.length > 0 ? [...attachedImages] : undefined }]);
      if (viewMode === 'arena') {
        setArenaMessagesB(prev => [...prev, { role: 'user', content: textToSend, images: attachedImages.length > 0 ? [...attachedImages] : undefined }]);
      }
      setUserMessage('');
      setAttachedImages([]);
    }

    setSending(true);
    setLatency(null);
    setError('');

    // Model A Request
    executeModelRequest(selectedModel, convoA)
      .then(({ content, elapsed }) => {
        const { thinking, cleanContent } = parseThinkingAndContent(content);
        setMessages(prev => [...prev, { role: 'assistant', content: cleanContent || content, thinking, latency: elapsed, modelId: selectedModel }]);
        setLatency(elapsed);
      })
      .catch(err => {
        const msg = err.message || 'Request failed';
        setMessages(prev => [...prev, { role: 'assistant', content: msg, error: true, modelId: selectedModel }]);
        setError(msg);
      })
      .finally(() => setSending(false));

    // Arena Model B Request (if in Arena mode)
    if (viewMode === 'arena' && arenaModelB) {
      setSendingArenaB(true);
      const validHistoryB = arenaMessagesB.filter(m => !m.error && m.role !== 'system');
      const convoB: any[] = [
        ...(systemMessage.trim() ? [{ role: 'system' as const, content: systemMessage.trim() }] : []),
        ...validHistoryB.map(m => (m.images?.length ? { role: m.role, content: m.content, images: m.images } : { role: m.role, content: m.content })),
        { role: 'user' as const, content: textToSend, ...(attachedImages.length > 0 ? { images: attachedImages } : {}) },
      ];

      executeModelRequest(arenaModelB, convoB)
        .then(({ content, elapsed }) => {
          const { thinking, cleanContent } = parseThinkingAndContent(content);
          setArenaMessagesB(prev => [...prev, { role: 'assistant', content: cleanContent || content, thinking, latency: elapsed, modelId: arenaModelB }]);
        })
        .catch(err => {
          setArenaMessagesB(prev => [...prev, { role: 'assistant', content: err.message || 'Error', error: true, modelId: arenaModelB }]);
        })
        .finally(() => setSendingArenaB(false));
    }
  };

  const clearChat = () => {
    if (speakingIndex !== null) {
      window.speechSynthesis?.cancel();
      setSpeakingIndex(null);
    }
    setMessages([]);
    setArenaMessagesB([]);
    setError('');
    setLatency(null);
    setAttachedImages([]);
  };

  const copyMessage = (index: number, content: string) => {
    navigator.clipboard?.writeText(content).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 1500);
    }).catch(() => {});
  };

  const copyAsCurl = () => {
    const token = localStorage.getItem('admin_token') || '<YOUR_API_KEY>';
    const payload = {
      model: selectedModel,
      messages: [
        ...(systemMessage.trim() ? [{ role: 'system', content: systemMessage.trim() }] : []),
        { role: 'user', content: userMessage || 'Hello, world!' },
      ],
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://api.cheaprouter.com';
    const curl = `curl ${origin}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify(payload, null, 2)}'`;

    navigator.clipboard.writeText(curl).then(() => {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    });
  };

  const exportChat = () => {
    const data = JSON.stringify({ model: selectedModel, parameters: { temperature, topP, maxTokens }, messages }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-models-transcript-${selectedModel}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleThinking = (index: number) => {
    setExpandedThinking(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const filteredModels = models.filter(m => {
    if (activeCapFilter === 'all') return true;
    if (activeCapFilter === 'text') return m.text;
    if (activeCapFilter === 'reasoning') return m.reasoning;
    if (activeCapFilter === 'vision') return m.vision;
    if (activeCapFilter === 'audio') return m.audio;
    if (activeCapFilter === 'image') return m.image;
    if (activeCapFilter === 'video') return m.video;
    return true;
  });

  const currentModel = models.find(m => m.id === selectedModel);
  const currentModelB = models.find(m => m.id === arenaModelB);

  const inputLen = String(userMessage || '').length;
  const userChatCount = messages.filter(m => m.role === 'user').length;
  const responseCount = messages.filter(m => m.role === 'assistant' && !m.error).length;
  const userChatCountB = arenaMessagesB.filter(m => m.role === 'user').length;
  const responseCountB = arenaMessagesB.filter(m => m.role === 'assistant' && !m.error).length;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: 'var(--color-text-main, #F2F4F7)', background: 'transparent' }}>
      <style>{`
        .pgLayout { display: flex; flex-direction: column; gap: 10px; height: calc(100vh - 84px); min-height: 540px; box-sizing: border-box; }
        
        .topControlsBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          background: var(--color-card-bg, #FFFFFF);
          border: 1px solid var(--color-border, #E2E8F0);
          border-radius: 12px;
          padding: 6px 12px;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .modeToggle { display: inline-flex; background: var(--color-bg-soft, #F1F5F9); border: 1px solid var(--color-border, #E2E8F0); border-radius: 8px; padding: 2px; gap: 3px; }
        .modeBtn { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: none; background: transparent; color: var(--color-text-muted, #64748B); cursor: pointer; transition: all 0.2s; }
        .modeBtn.active { background: var(--color-primary, #EF4444); color: #fff; box-shadow: 0 2px 6px rgba(239,68,68,0.25); }

        .testGrid { display: grid; grid-template-columns: 310px 1fr; gap: 10px; flex: 1; min-height: 0; }
        .testGrid.arena { grid-template-columns: 280px 1fr 1fr; }

        .testCard {
          background: var(--color-card-bg, #FFFFFF);
          border: 1px solid var(--color-border, #E2E8F0);
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .configScroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 2px; }
        .fieldLabel { display: block; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted, #64748B); margin-bottom: 4px; }

        .capTabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
        .capTab { font-size: 10.5px; font-weight: 600; padding: 3px 8px; border-radius: 999px; border: 1px solid var(--color-border, #E2E8F0); background: var(--color-bg-soft, #F8FAFC); color: var(--color-text-muted, #64748B); cursor: pointer; display: inline-flex; align-items: center; gap: 3px; transition: all 0.15s; }
        .capTab:hover { border-color: rgba(239,68,68,0.4); color: var(--color-text-main); }
        .capTab.active { background: rgba(239,68,68,0.1); color: #EF4444; border-color: #EF4444; }

        .select, .textarea { width: 100%; background: var(--color-bg, #FFFFFF); border: 1px solid var(--color-border, #E2E8F0); border-radius: 9px; color: var(--color-text-main, #0F172A); font-size: 12.5px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .select { padding: 7px 10px; cursor: pointer; }
        .textarea { padding: 7px 10px; resize: none; line-height: 1.45; }
        .select:focus, .textarea:focus { border-color: var(--color-primary, #EF4444); box-shadow: 0 0 0 2px rgba(239,68,68,0.12); }
        .selectWrap { position: relative; display: flex; align-items: center; }
        .selectWrap .selIcon { position: absolute; left: 10px; pointer-events: none; color: var(--color-text-muted); display: flex; }
        .selectWrap .select { padding-left: 32px; }

        /* ── MODEL HERO BANNER (Enhanced for Light & Dark Mode) ── */
        .modelHeroBanner {
          background: var(--color-bg-soft, #F8FAFC);
          border: 1px solid var(--color-border, #E2E8F0);
          border-left: 3px solid var(--color-primary, #EF4444);
          border-radius: 9px;
          padding: 8px 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
        }
        .modelHeroBanner.arenaB {
          border-left-color: #0284C7;
          background: rgba(2,132,199,0.04);
          border-color: rgba(2,132,199,0.2);
        }
        .modelHeroTitle {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-text-main, #0F172A);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .modelHeroSub { font-size: 10.5px; color: var(--color-text-muted, #64748B); margin-top: 2px; font-family: monospace; }

        .capsRow { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
        .capBadge {
          font-size: 9.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 5px;
          display: inline-flex;
          align-items: center;
          gap: 3.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        /* High-contrast crisp Light Mode Badges */
        .capBadge.text { background: rgba(37,99,235,0.08); color: #1D4ED8; border: 1px solid rgba(37,99,235,0.22); }
        .capBadge.reasoning { background: rgba(124,58,237,0.08); color: #6D28D9; border: 1px solid rgba(124,58,237,0.22); }
        .capBadge.vision { background: rgba(5,150,105,0.08); color: #047857; border: 1px solid rgba(5,150,105,0.22); }
        .capBadge.audio { background: rgba(217,119,6,0.08); color: #B45309; border: 1px solid rgba(217,119,6,0.22); }
        .capBadge.image { background: rgba(219,39,119,0.08); color: #BE185D; border: 1px solid rgba(219,39,119,0.22); }
        .capBadge.video { background: rgba(225,29,72,0.08); color: #BE123C; border: 1px solid rgba(225,29,72,0.22); }

        /* Dark Theme overrides for Model Hero Card & Components */
        [data-theme="dark"] .testCard { background: #15191E; border-color: #262C34; }
        [data-theme="dark"] .topControlsBar { background: #15191E; border-color: #262C34; }
        [data-theme="dark"] .modeToggle { background: #0B0D10; border-color: #262C34; }
        [data-theme="dark"] .capTab { background: #0B0D10; border-color: #262C34; color: #9AA3AF; }
        [data-theme="dark"] .select, [data-theme="dark"] .textarea { background: #0B0D10; border-color: #262C34; color: #F2F4F7; }
        [data-theme="dark"] .quickChip { background: #0B0D10; border-color: #262C34; color: #9AA3AF; }
        [data-theme="dark"] .bubbleAvatar { background: #0B0D10; border-color: #262C34; color: #9AA3AF; }
        [data-theme="dark"] .bubbleBody { background: #0B0D10; border-color: #262C34; color: #F2F4F7; }
        [data-theme="dark"] .bubble.user .bubbleBody { background: #1F2733; border-color: rgba(239,68,68,0.22); color: #F2F4F7; }
        [data-theme="dark"] .unifiedInputBox { background: #0B0D10; border-color: #262C34; }
        [data-theme="dark"] .unifiedTextarea { color: #F2F4F7; }
        [data-theme="dark"] .markdownContent pre { background: #07080A; border-color: #1F242C; color: #F2F4F7; }
        [data-theme="dark"] .markdownContent code { background: rgba(255,255,255,0.08); color: #F87171; }

        [data-theme="dark"] .modelHeroBanner {
          background: linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(31,39,51,0.4) 100%);
          border: 1px solid rgba(239,68,68,0.22);
          border-left: 3px solid var(--color-primary, #EF4444);
          box-shadow: none;
        }
        [data-theme="dark"] .modelHeroBanner.arenaB {
          background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(31,39,51,0.4) 100%);
          border: 1px solid rgba(56,189,248,0.25);
          border-left-color: #38BDF8;
        }
        [data-theme="dark"] .modelHeroTitle { color: #F2F4F7; }
        [data-theme="dark"] .capBadge.text { background: rgba(59,130,246,0.14); color: #60A5FA; border-color: rgba(59,130,246,0.3); }
        [data-theme="dark"] .capBadge.reasoning { background: rgba(168,85,247,0.14); color: #C084FC; border-color: rgba(168,85,247,0.35); }
        [data-theme="dark"] .capBadge.vision { background: rgba(16,185,129,0.14); color: #34D399; border-color: rgba(16,185,129,0.3); }
        [data-theme="dark"] .capBadge.audio { background: rgba(245,158,11,0.14); color: #FBBF24; border-color: rgba(245,158,11,0.3); }
        [data-theme="dark"] .capBadge.image { background: rgba(244,114,182,0.14); color: #F472B6; border-color: rgba(244,114,182,0.3); }
        [data-theme="dark"] .capBadge.video { background: rgba(251,113,133,0.14); color: #FB7185; border-color: rgba(251,113,133,0.3); }

        .quickChips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
        .quickChip { font-size: 10.5px; padding: 3px 8px; border-radius: 6px; border: 1px solid var(--color-border, #E2E8F0); background: var(--color-bg-soft, #F8FAFC); color: var(--color-text-muted, #64748B); cursor: pointer; transition: all 0.15s; }
        .quickChip:hover { border-color: var(--color-primary, #EF4444); color: var(--color-primary, #EF4444); background: rgba(239,68,68,0.08); }

        .chatCard { display: flex; flex-direction: column; height: 100%; min-height: 0; }
        .chatScroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px; min-height: 0; }
        .bubble { display: flex; gap: 8px; align-items: flex-start; max-width: 94%; animation: rise 0.2s ease; }
        .bubble.user { align-self: flex-end; flex-direction: row-reverse; }
        .bubbleAvatar { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--color-border, #E2E8F0); background: var(--color-bg-soft, #F8FAFC); color: var(--color-text-muted, #64748B); }
        .bubble.user .bubbleAvatar { background: var(--color-primary-soft, rgba(239,68,68,0.1)); color: var(--color-primary, #EF4444); border-color: rgba(239,68,68,0.25); }
        .bubbleBody { background: var(--color-card-bg-2, #F8FAFC); border: 1px solid var(--color-border, #E2E8F0); border-radius: 12px; padding: 9px 12px; font-size: 13px; line-height: 1.5; word-break: break-word; color: var(--color-text-main, #0F172A); }
        .bubble.user .bubbleBody { background: var(--color-primary-soft, rgba(239,68,68,0.08)); border-color: rgba(239,68,68,0.22); color: var(--color-text-main, #0F172A); }
        .bubbleBody.error { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.06); color: #DC2626; }

        .markdownContent pre { background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 7px; padding: 8px 10px; overflow-x: auto; margin: 6px 0; font-family: monospace; font-size: 11.5px; color: var(--color-text-main, #0F172A); }
        .markdownContent code { background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 4px; font-family: monospace; font-size: 11.5px; color: #DC2626; }
        .markdownContent p { margin: 0 0 6px 0; }
        .markdownContent p:last-child { margin-bottom: 0; }
        .markdownContent ul, .markdownContent ol { margin: 3px 0 6px 16px; padding: 0; }

        .thinkingBox { margin-bottom: 6px; border: 1px solid rgba(168,85,247,0.3); background: rgba(168,85,247,0.05); border-radius: 8px; overflow: hidden; font-size: 11.5px; }
        .thinkingHeader { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; background: rgba(168,85,247,0.1); color: #7C3AED; font-weight: 600; cursor: pointer; }
        .thinkingContent { padding: 8px; color: #6D28D9; border-top: 1px dashed rgba(168,85,247,0.2); font-size: 11.5px; font-family: monospace; white-space: pre-wrap; line-height: 1.4; max-height: 160px; overflow-y: auto; }

        .bubbleImgs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
        .bubbleImg { max-width: 140px; max-height: 100px; border-radius: 7px; border: 1px solid var(--color-border); object-fit: cover; }

        .bubbleMeta { display: flex; align-items: center; gap: 6px; margin-top: 5px; }
        .bubbleRole { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted, #64748B); }
        .iconActionBtn { background: transparent; border: none; color: var(--color-text-muted, #64748B); cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; gap: 3px; font-size: 10.5px; border-radius: 5px; transition: all 0.15s; }
        .iconActionBtn:hover { color: var(--color-primary, #EF4444); background: rgba(239,68,68,0.08); }
        .iconActionBtn.active { color: #10B981; }

        /* ── UNIFIED COMPACT INTEGRATED INPUT BOX ── */
        .composer { border-top: 1px dashed var(--color-border, #E2E8F0); padding-top: 8px; margin-top: 8px; flex-shrink: 0; }
        .unifiedInputBox {
          position: relative;
          background: var(--color-card-bg, #FFFFFF);
          border: 1px solid var(--color-border, #E2E8F0);
          border-radius: 12px;
          padding: 8px 10px 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .unifiedInputBox:focus-within {
          border-color: var(--color-primary, #EF4444);
          box-shadow: 0 0 0 2px rgba(239,68,68,0.12), 0 4px 16px rgba(0,0,0,0.04);
        }
        .unifiedTextarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text-main, #0F172A);
          font-size: 13px;
          line-height: 1.45;
          resize: none;
          min-height: 38px;
          max-height: 120px;
          padding: 0;
          font-family: inherit;
        }
        .unifiedTextarea::placeholder {
          color: var(--color-text-muted, #94A3B8);
        }
        .attachedPreviews { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
        .attachedItem { position: relative; width: 42px; height: 42px; border-radius: 6px; overflow: hidden; border: 1px solid var(--color-primary); }
        .attachedItem img { width: 100%; height: 100%; object-fit: cover; }
        .removeImgBtn { position: absolute; top: 1px; right: 1px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .inputBottomBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .inputIconBtns {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .inputIconBtn {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid transparent;
          color: var(--color-text-muted, #9AA3AF);
          cursor: pointer;
          transition: all 0.15s;
        }
        .inputIconBtn:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .inputIconBtn.recording {
          background: rgba(239,68,68,0.22);
          border-color: #EF4444;
          color: #EF4444;
          animation: pulseRed 1.4s infinite;
        }
        .inputIconBtn.hasVision {
          color: #34D399;
        }
        .badgeCount {
          position: absolute;
          top: -3px;
          right: -3px;
          background: var(--color-primary, #EF4444);
          color: #fff;
          font-size: 8.5px;
          font-weight: 700;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .inputRightGroup {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .inputCharCount {
          font-size: 10.5px;
          color: var(--color-text-muted, #9AA3AF);
          user-select: none;
        }
        .inputSendBtn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-primary, #EF4444);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(239,68,68,0.3);
          flex-shrink: 0;
        }
        .inputSendBtn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
        .inputSendBtn:disabled {
          background: #1B1F26;
          color: #4B5565;
          box-shadow: none;
          cursor: not-allowed;
        }

        .headerToolBtn { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 600; padding: 5px 10px; border-radius: 7px; background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); color: var(--color-text-muted); cursor: pointer; transition: all 0.15s; }
        .headerToolBtn:hover { color: #fff; border-color: var(--color-primary, #EF4444); }

        .sliderRow { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
        .sliderHead { display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 600; color: var(--color-text-muted); }
        .sliderInput { -webkit-appearance: none; width: 100%; height: 5px; border-radius: 3px; background: var(--color-border, #262C34); outline: none; cursor: pointer; accent-color: var(--color-primary, #EF4444); }

        @keyframes rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseRed { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 5px rgba(239,68,68,0); } }
        @keyframes blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
        .typing { display: inline-flex; align-items: center; gap: 4px; padding: 3px 0; }
        .typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--color-text-muted); animation: blink 1.2s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        @media (max-width: 1080px) { .testGrid { grid-template-columns: 1fr; } .testGrid.arena { grid-template-columns: 1fr; } }
      `}</style>

      <div className="pgLayout">
        {/* ── TOP CONTROL BAR ── */}
        <div className="topControlsBar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="modeToggle">
              <button
                className={`modeBtn ${viewMode === 'chat' ? 'active' : ''}`}
                onClick={() => setViewMode('chat')}
              >
                <MessageSquare size={12} /> Single Model
              </button>
              <button
                className={`modeBtn ${viewMode === 'arena' ? 'active' : ''}`}
                onClick={() => setViewMode('arena')}
              >
                <Swords size={12} /> Arena Battle
              </button>
            </div>

            <button
              className={`headerToolBtn ${showParams ? 'active' : ''}`}
              onClick={() => setShowParams(prev => !prev)}
            >
              <Sliders size={12} />
              <span>Params ({temperature}T · {maxTokens} tok)</span>
              {showParams ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>

            <button
              className={`headerToolBtn ${showInspector ? 'active' : ''}`}
              onClick={() => setShowInspector(prev => !prev)}
            >
              <Terminal size={12} />
              <span>Inspector</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="headerToolBtn" onClick={copyAsCurl} title="Copy working cURL command">
              {copiedCurl ? <CheckCheck size={12} color="#10B981" /> : <Code size={12} />}
              <span>{copiedCurl ? 'Copied cURL!' : 'cURL'}</span>
            </button>

            <button className="headerToolBtn" onClick={exportChat} disabled={messages.length === 0} title="Export transcript as JSON">
              <Download size={12} />
              <span>Export</span>
            </button>

            <button className="headerToolBtn" onClick={clearChat} disabled={messages.length === 0} title="Clear conversation history">
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* ── COLLAPSIBLE HYPERPARAMETERS DRAWER ── */}
        {showParams && (
          <div className="testCard" style={{ background: '#0F1318', border: '1px solid rgba(239,68,68,0.25)', flexShrink: 0, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sliders size={14} color="#EF4444" />
                <h4 style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>Sampling Parameters</h4>
              </div>
              <button
                className="iconActionBtn"
                onClick={() => { setTemperature(0.7); setTopP(1.0); setMaxTokens(2048); }}
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div className="sliderRow">
                <div className="sliderHead">
                  <span>Temp: <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{temperature}</strong></span>
                  <span style={{ fontSize: 10 }}>{temperature < 0.3 ? '🎯 Precise' : temperature > 1.0 ? '🎨 Creative' : '⚖️ Balanced'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  className="sliderInput"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                />
              </div>

              <div className="sliderRow">
                <div className="sliderHead">
                  <span>Top-P: <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{topP}</strong></span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  className="sliderInput"
                  value={topP}
                  onChange={e => setTopP(parseFloat(e.target.value))}
                />
              </div>

              <div className="sliderRow">
                <div className="sliderHead">
                  <span>Max Tokens: <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{maxTokens}</strong></span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="8192"
                  step="128"
                  className="sliderInput"
                  value={maxTokens}
                  onChange={e => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── COLLAPSIBLE PAYLOAD INSPECTOR ── */}
        {showInspector && (
          <div className="testCard" style={{ background: '#090B0E', border: '1px solid #262C34', flexShrink: 0, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TerminalSquare size={14} color="#38BDF8" />
                <h4 style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>Request & Response Raw Payload Inspector</h4>
              </div>
              <button className="iconActionBtn" onClick={() => setShowInspector(false)}><X size={12} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="fieldLabel">Last Request JSON</label>
                <pre style={{ background: '#07080A', border: '1px solid #1F242C', borderRadius: 6, padding: 8, margin: 0, fontSize: 10.5, maxHeight: 110, overflowY: 'auto' }}>
                  {lastRawPayload ? JSON.stringify(lastRawPayload, null, 2) : '// No request sent yet'}
                </pre>
              </div>
              <div>
                <label className="fieldLabel">Last Response JSON</label>
                <pre style={{ background: '#07080A', border: '1px solid #1F242C', borderRadius: 6, padding: 8, margin: 0, fontSize: 10.5, maxHeight: 110, overflowY: 'auto' }}>
                  {lastRawResponse ? JSON.stringify(lastRawResponse, null, 2) : '// No response received yet'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN TESTING GRID ── */}
        <div className={`testGrid ${viewMode === 'arena' ? 'arena' : ''}`}>
          {/* ── LEFT CONFIG PANEL ── */}
          <div className="testCard">
            <div className="configScroll">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-soft, #1F2733)', color: 'var(--color-primary, #EF4444)' }}>
                  <Cpu size={14} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Model Selection</h3>
                </div>
              </div>

              {/* Capability filter tabs */}
              <div>
                <label className="fieldLabel">Modality</label>
                <div className="capTabs">
                  <button className={`capTab ${activeCapFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveCapFilter('all')}>
                    <Layers size={10} /> All ({models.length})
                  </button>
                  <button className={`capTab ${activeCapFilter === 'text' ? 'active' : ''}`} onClick={() => setActiveCapFilter('text')}>
                    <MessageSquare size={10} /> Text
                  </button>
                  <button className={`capTab ${activeCapFilter === 'reasoning' ? 'active' : ''}`} onClick={() => setActiveCapFilter('reasoning')}>
                    <Brain size={10} /> Reasoning
                  </button>
                  <button className={`capTab ${activeCapFilter === 'vision' ? 'active' : ''}`} onClick={() => setActiveCapFilter('vision')}>
                    <Eye size={10} /> Vision
                  </button>
                  <button className={`capTab ${activeCapFilter === 'audio' ? 'active' : ''}`} onClick={() => setActiveCapFilter('audio')}>
                    <Mic size={10} /> Audio
                  </button>
                </div>
              </div>

              <div>
                <label className="fieldLabel">{viewMode === 'arena' ? 'Model A' : 'AI Model'}</label>
                <div className="selectWrap">
                  <span className="selIcon"><Sparkles size={13} /></span>
                  <select
                    className="select"
                    value={selectedModel}
                    onChange={e => {
                      setSelectedModel(e.target.value);
                      setLatency(null);
                      setError('');
                    }}
                  >
                    {loadingModels ? (
                      <option>Loading models…</option>
                    ) : filteredModels.length === 0 ? (
                      <option>No models for this filter</option>
                    ) : (
                      filteredModels.map(m => (
                        <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Model A hero banner */}
              {currentModel && (
                <div className="modelHeroBanner">
                  <div className="modelHeroTitle">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Sparkles size={12} color="var(--color-primary, #EF4444)" />
                      <span>{currentModel.name}</span>
                    </span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, background: 'var(--color-primary-soft, rgba(239,68,68,0.1))', color: 'var(--color-primary, #EF4444)', border: '1px solid rgba(239,68,68,0.22)', padding: '1.5px 6px', borderRadius: 4 }}>
                      {currentModel.provider}
                    </span>
                  </div>
                  <div className="capsRow">
                    {currentModel.text && <span className="capBadge text"><MessageSquare size={8.5} /> Text</span>}
                    {currentModel.reasoning && <span className="capBadge reasoning"><Brain size={8.5} /> Reasoning</span>}
                    {currentModel.vision && <span className="capBadge vision"><Eye size={8.5} /> Vision</span>}
                    {currentModel.audio && <span className="capBadge audio"><Mic size={8.5} /> Voice</span>}
                  </div>
                </div>
              )}

              {/* Arena Model B Selector */}
              {viewMode === 'arena' && (
                <div>
                  <label className="fieldLabel">Model B (Opponent)</label>
                  <div className="selectWrap">
                    <span className="selIcon"><Swords size={13} /></span>
                    <select
                      className="select"
                      value={arenaModelB}
                      onChange={e => setArenaModelB(e.target.value)}
                    >
                      {models.map(m => (
                        <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>
                      ))}
                    </select>
                  </div>
                  {currentModelB && (
                    <div className="modelHeroBanner arenaB" style={{ marginTop: 6 }}>
                      <div className="modelHeroTitle">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Swords size={12} color="#0284C7" />
                          <span>{currentModelB.name}</span>
                        </span>
                        <span style={{ fontSize: 9.5, fontWeight: 700, background: 'rgba(56,189,248,0.12)', color: '#0284C7', border: '1px solid rgba(56,189,248,0.25)', padding: '1.5px 6px', borderRadius: 4 }}>
                          {currentModelB.provider}
                        </span>
                      </div>
                      <div className="capsRow">
                        {currentModelB.text && <span className="capBadge text"><MessageSquare size={8.5} /> Text</span>}
                        {currentModelB.reasoning && <span className="capBadge reasoning"><Brain size={8.5} /> Reasoning</span>}
                        {currentModelB.vision && <span className="capBadge vision"><Eye size={8.5} /> Vision</span>}
                        {currentModelB.audio && <span className="capBadge audio"><Mic size={8.5} /> Voice</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* System Message */}
              <div>
                <label className="fieldLabel">System Prompt</label>
                <textarea
                  className="textarea"
                  style={{ minHeight: 68, resize: 'vertical' }}
                  rows={3}
                  value={systemMessage}
                  onChange={e => setSystemMessage(e.target.value)}
                  placeholder="Set system instructions and behavior for this model…"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {PRESET_SYSTEM_MESSAGES.map((p, i) => (
                    <button
                      key={i}
                      className="quickChip"
                      style={{ fontSize: 10, padding: '2px 6px', borderColor: systemMessage === p.text ? '#EF4444' : undefined, color: systemMessage === p.text ? '#EF4444' : undefined }}
                      onClick={() => setSystemMessage(p.text)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── CHAT PANEL (OR MODEL A CHAT IN ARENA) ── */}
          <div className="testCard chatCard">
            {/* Header (Only in Arena Mode to distinguish Model A) */}
            {viewMode === 'arena' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 5, marginBottom: 5, flexShrink: 0 }}>
                <span style={{ fontSize: 10, background: '#EF4444', color: '#fff', padding: '1.5px 6px', borderRadius: 4, fontWeight: 700 }}>
                  Model A: {currentModel?.name}
                </span>
                {latency !== null && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: latency < 3500 ? '#10B981' : '#F59E0B' }}>
                    ⚡ {latency}ms
                  </span>
                )}
              </div>
            )}

            {/* Chat message stream */}
            <div className="chatScroll">
              {messages.length === 0 && !sending && (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--color-text-muted)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--color-primary-soft, rgba(239,68,68,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Sparkles size={18} color="#EF4444" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-main, #0F172A)', marginBottom: 2 }}>
                    Ready to Test {currentModel?.name}
                  </div>
                  <div style={{ fontSize: 11.5, maxWidth: 300, margin: '0 auto', lineHeight: 1.4 }}>
                    Pick a benchmark prompt below or start typing.
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`bubble ${m.role === 'user' ? 'user' : ''}`}>
                  <div className="bubbleAvatar">
                    {m.role === 'user' ? <UserIcon size={12} /> : <Bot size={12} />}
                  </div>
                  <div style={{ maxWidth: '100%' }}>
                    {m.images && m.images.length > 0 && (
                      <div className="bubbleImgs">
                        {m.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Attached" className="bubbleImg" />
                        ))}
                      </div>
                    )}

                    {m.thinking && (
                      <div className="thinkingBox">
                        <div className="thinkingHeader" onClick={() => toggleThinking(i)}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Brain size={11} /> Thinking Process
                          </span>
                          {expandedThinking[i] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </div>
                        {expandedThinking[i] && (
                          <div className="thinkingContent">{m.thinking}</div>
                        )}
                      </div>
                    )}

                    <div className={`bubbleBody ${m.error ? 'error' : ''}`}>
                      {m.role === 'assistant' && !m.error ? (
                        <div className="markdownContent">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>

                    <div className="bubbleMeta">
                      <span className="bubbleRole">{m.role}</span>
                      {m.latency && <span className="bubbleRole" style={{ color: '#10B981' }}>{m.latency}ms</span>}

                      {m.error && i > 0 && messages[i - 1]?.role === 'user' && (
                        <button className="iconActionBtn" onClick={() => sendMessage(messages[i - 1].content)} style={{ color: '#F87171' }}>
                          <RefreshCw size={10} /> Retry
                        </button>
                      )}

                      {!m.error && m.role === 'assistant' && (
                        <button className={`iconActionBtn ${speakingIndex === i ? 'active' : ''}`} onClick={() => speakText(i, m.content)}>
                          {speakingIndex === i ? <VolumeX size={11} color="#EF4444" /> : <Volume2 size={11} />}
                          <span>{speakingIndex === i ? 'Stop' : 'Listen'}</span>
                        </button>
                      )}

                      {!m.error && (
                        <button className={`iconActionBtn ${copiedIndex === i ? 'active' : ''}`} onClick={() => copyMessage(i, m.content)}>
                          {copiedIndex === i ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="bubble">
                  <div className="bubbleAvatar"><Bot size={12} /></div>
                  <div className="bubbleBody">
                    <div className="typing"><span /><span /><span /></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── COMPOSER (Single Model Mode) ── */}
            {viewMode === 'chat' && (
              <div className="composer">
                {/* Top Row: Model dropdown on far left, then User Chats, Responses, Latency, Char count on left; Benchmark chips on right */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                    {/* Compact Model Selector Dropdown on the far left */}
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <Sparkles size={11} color="var(--color-primary, #EF4444)" style={{ position: 'absolute', left: 7, pointerEvents: 'none' }} />
                      <select
                        value={selectedModel}
                        onChange={e => {
                          setSelectedModel(e.target.value);
                          setLatency(null);
                          setError('');
                        }}
                        style={{
                          background: 'var(--color-card-bg, #FFFFFF)',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          borderRadius: 6,
                          color: 'var(--color-text-main, #0F172A)',
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '2.5px 18px 2.5px 22px',
                          maxWidth: 155,
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          outline: 'none',
                          cursor: 'pointer',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                        }}
                        title={`Selected: ${currentModel?.name} (${currentModel?.provider})`}
                      >
                        {filteredModels.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} — {m.provider}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={10} color="var(--color-text-muted)" style={{ position: 'absolute', right: 5, pointerEvents: 'none' }} />
                    </div>

                    {/* User Chats Icon + Count (with tooltip) */}
                    <div
                      title={`User Chats: ${userChatCount} message${userChatCount === 1 ? '' : 's'} sent`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', padding: '2.5px 7px', borderRadius: 6, fontSize: 11, cursor: 'help' }}
                    >
                      <UserIcon size={11} color="var(--color-primary, #EF4444)" />
                      <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{userChatCount}</strong>
                    </div>

                    {/* AI Responses Icon + Count (with tooltip) */}
                    <div
                      title={`AI Responses: ${responseCount} response${responseCount === 1 ? '' : 's'} received`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', padding: '2.5px 7px', borderRadius: 6, fontSize: 11, cursor: 'help' }}
                    >
                      <Bot size={11} color="#10B981" />
                      <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{responseCount}</strong>
                    </div>

                    {/* Latency (with tooltip) */}
                    {latency !== null && (
                      <span
                        title={`Model Latency: ${latency}ms`}
                        style={{ fontSize: 10.5, fontWeight: 700, color: latency < 3500 ? '#10B981' : '#F59E0B', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2.5px 6px', borderRadius: 6, cursor: 'help' }}
                      >
                        ⚡ {latency}ms
                      </span>
                    )}

                    {/* Char count & Enter hint */}
                    <span
                      title="Characters entered (Press Enter to send, Shift+Enter for newline)"
                      style={{ fontSize: 10.5, color: 'var(--color-text-muted, #64748B)', background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', padding: '2.5px 7px', borderRadius: 6, cursor: 'help' }}
                    >
                      {inputLen}c · Enter ↵
                    </span>
                  </div>

                  {/* Right Side: Benchmark Prompts + Action Icons (Voice, Image, Send) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <div className="quickChips" style={{ marginBottom: 0 }}>
                      {BENCHMARK_PROMPTS.map((bp, i) => (
                        <button key={i} className="quickChip" onClick={() => setUserMessage(bp.prompt)}>
                          {bp.label}
                        </button>
                      ))}
                    </div>

                    {/* Voice Input Button */}
                    <button
                      type="button"
                      className={`inputIconBtn ${isRecording ? 'recording' : ''}`}
                      onClick={toggleRecording}
                      title={isRecording ? 'Stop voice recording' : 'Voice Input (Speech-to-Text)'}
                      style={{ width: 26, height: 26, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: 6 }}
                    >
                      {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
                    </button>

                    {/* Attach Image Button */}
                    <button
                      type="button"
                      className={`inputIconBtn ${currentModel?.vision ? 'hasVision' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach Image (or press Ctrl+V to paste)"
                      style={{ width: 26, height: 26, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: 6 }}
                    >
                      <ImageIcon size={13} />
                      {attachedImages.length > 0 && (
                        <span className="badgeCount">{attachedImages.length}</span>
                      )}
                    </button>

                    {/* Send Button */}
                    <button
                      type="button"
                      className="inputSendBtn"
                      onClick={() => sendMessage()}
                      disabled={sending || !selectedModel || (!userMessage.trim() && attachedImages.length === 0)}
                      title="Send Message (Enter ↵)"
                      style={{ width: 28, height: 26, borderRadius: 6 }}
                    >
                      {sending ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                    </button>
                  </div>
                </div>

                {/* ── UNIFIED COMPACT INTEGRATED INPUT BOX ── */}
                <div className="unifiedInputBox" style={{ padding: '7px 10px' }}>
                  {attachedImages.length > 0 && (
                    <div className="attachedPreviews">
                      {attachedImages.map((img, idx) => (
                        <div key={idx} className="attachedItem">
                          <img src={img} alt="Preview" />
                          <button type="button" className="removeImgBtn" onClick={() => removeAttachedImage(idx)}>
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    className="unifiedTextarea"
                    rows={1}
                    value={userMessage}
                    onChange={e => setUserMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    placeholder={
                      isRecording
                        ? '🎙️ Listening to your mic…'
                        : currentModel?.vision
                        ? `Ask or paste/attach image for ${currentModel.name}…`
                        : `Type a message for ${currentModel ? currentModel.name : 'the model'}…`
                    }
                    disabled={sending}
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── ARENA MODEL B PANEL (Arena Comparison Mode) ── */}
          {viewMode === 'arena' && (
            <div className="testCard chatCard">
              {/* Header (Arena Mode Model B indicator) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 5, marginBottom: 5, flexShrink: 0 }}>
                <span style={{ fontSize: 10, background: '#38BDF8', color: '#000', padding: '1.5px 6px', borderRadius: 4, fontWeight: 700 }}>
                  Model B: {currentModelB?.name}
                </span>
              </div>

              <div className="chatScroll">
                {arenaMessagesB.length === 0 && !sendingArenaB && (
                  <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--color-text-muted)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Swords size={18} color="#38BDF8" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 2 }}>
                      Model B: {currentModelB?.name}
                    </div>
                    <div style={{ fontSize: 11.5, maxWidth: 280, margin: '0 auto', lineHeight: 1.4 }}>
                      Send a prompt below to see both models battle side-by-side!
                    </div>
                  </div>
                )}

                {arenaMessagesB.map((m, i) => (
                  <div key={i} className={`bubble ${m.role === 'user' ? 'user' : ''}`}>
                    <div className="bubbleAvatar">
                      {m.role === 'user' ? <UserIcon size={12} /> : <Bot size={12} />}
                    </div>
                    <div style={{ maxWidth: '100%' }}>
                      <div className={`bubbleBody ${m.error ? 'error' : ''}`}>
                        {m.role === 'assistant' && !m.error ? (
                          <div className="markdownContent">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          m.content
                        )}
                      </div>
                      <div className="bubbleMeta">
                        <span className="bubbleRole">{m.role}</span>
                        {m.latency && <span className="bubbleRole" style={{ color: '#38BDF8' }}>{m.latency}ms</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {sendingArenaB && (
                  <div className="bubble">
                    <div className="bubbleAvatar"><Bot size={12} /></div>
                    <div className="bubbleBody">
                      <div className="typing"><span /><span /><span /></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── ARENA SHARED COMPOSER (When in Arena Mode) ── */}
        {viewMode === 'arena' && (
          <div className="testCard" style={{ background: 'var(--color-card-bg, #FFFFFF)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 12px', flexShrink: 0 }}>
            {/* Top Row: User Chats, Responses, Char count on left; Benchmark chips on right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                {/* User Chats Icon + Count (with tooltip) */}
                <div
                  title={`User Chats: ${userChatCount} messages`}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', padding: '2.5px 7px', borderRadius: 6, fontSize: 11, cursor: 'help' }}
                >
                  <UserIcon size={11} color="#EF4444" />
                  <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{userChatCount}</strong>
                </div>

                {/* Model A Responses Icon + Count (with tooltip) */}
                <div
                  title={`Model A Responses: ${responseCount}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', padding: '2.5px 7px', borderRadius: 6, fontSize: 11, cursor: 'help' }}
                >
                  <Bot size={11} color="#10B981" />
                  <span style={{ fontSize: 9.5, color: '#10B981', fontWeight: 700 }}>A:</span>
                  <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{responseCount}</strong>
                </div>

                {/* Model B Responses Icon + Count (with tooltip) */}
                <div
                  title={`Model B Responses: ${responseCountB}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', padding: '2.5px 7px', borderRadius: 6, fontSize: 11, cursor: 'help' }}
                >
                  <Bot size={11} color="#38BDF8" />
                  <span style={{ fontSize: 9.5, color: '#38BDF8', fontWeight: 700 }}>B:</span>
                  <strong style={{ color: 'var(--color-text-main, #0F172A)' }}>{responseCountB}</strong>
                </div>

                <span
                  title="Characters entered (Press Enter to send)"
                  style={{ fontSize: 10.5, color: 'var(--color-text-muted, #64748B)', background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', padding: '2.5px 7px', borderRadius: 6, cursor: 'help' }}
                >
                  {inputLen}c · Enter ↵
                </span>
              </div>

              {/* Right Side: Benchmark Prompts + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div className="quickChips" style={{ marginBottom: 0 }}>
                  {BENCHMARK_PROMPTS.map((bp, i) => (
                    <button key={i} className="quickChip" onClick={() => setUserMessage(bp.prompt)}>
                      {bp.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={`inputIconBtn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  title={isRecording ? 'Stop voice recording' : 'Voice Input'}
                  style={{ width: 26, height: 26, background: 'var(--color-bg-soft, #F8FAFC)', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: 6 }}
                >
                  {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
                </button>

                <button
                  type="button"
                  className="inputSendBtn"
                  onClick={() => sendMessage()}
                  disabled={sending || sendingArenaB || !selectedModel || !arenaModelB || !userMessage.trim()}
                  title="Launch Arena Battle"
                  style={{ width: 28, height: 26, borderRadius: 6 }}
                >
                  {sending || sendingArenaB ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Swords size={13} />}
                </button>
              </div>
            </div>

            <div className="unifiedInputBox" style={{ padding: '7px 10px' }}>
              <textarea
                className="unifiedTextarea"
                rows={1}
                value={userMessage}
                onChange={e => setUserMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder={`Send prompt to both ${currentModel?.name || 'Model A'} and ${currentModelB?.name || 'Model B'}…`}
                disabled={sending || sendingArenaB}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}