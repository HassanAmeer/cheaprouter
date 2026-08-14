'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Wand2
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
}

type CapabilityType = 'all' | 'text' | 'reasoning' | 'vision' | 'audio' | 'image' | 'video';

const PRESET_SYSTEM_MESSAGES = [
  { label: 'General', text: 'You are a helpful AI assistant. Respond as clearly and concisely as possible.' },
  { label: 'Code Expert', text: 'You are a senior software architect. Provide clean, secure, and production-ready code with concise explanations.' },
  { label: 'Deep Reasoning', text: 'You are an advanced analytical reasoner. Carefully think step-by-step, verify edge cases, and show your structured reasoning.' },
  { label: 'Vision / Image Analyst', text: 'You are an expert visual analysis assistant. Describe images accurately, detect subtle details, and interpret visual context thoroughly.' },
  { label: 'Creative Writer', text: 'You are a creative writer. Write vivid, engaging, and expressive content with natural flow.' },
];

export default function TestModelsPage() {
  const [models, setModels] = useState<TestModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [activeCapFilter, setActiveCapFilter] = useState<CapabilityType>('all');
  const [systemMessage, setSystemMessage] = useState(PRESET_SYSTEM_MESSAGES[0].text);
  const [userMessage, setUserMessage] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number>(-1);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
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
          pushLog('INFO', `AI models fetched (${all.length})`, { models: all });
        }
        setLoadingModels(false);
      })
      .catch(() => setLoadingModels(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Voice Input Speech Recognition Setup
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome or MS Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

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

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
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
    // Clean thinking tags if present
    const cleanText = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Image Upload Handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAttachedImages(prev => [...prev, String(reader.result)]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Parse Thinking Tags for Reasoning Models
  const parseThinkingAndContent = (rawContent: string): { thinking?: string; cleanContent: string } => {
    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      const thinking = thinkMatch[1].trim();
      const cleanContent = rawContent.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      return { thinking, cleanContent };
    }
    return { cleanContent: rawContent };
  };

  const sendMessage = async (retryText?: string) => {
    const textToSend = (retryText !== undefined ? retryText : userMessage).trim();
    if ((!textToSend && attachedImages.length === 0) || !selectedModel || sending) return;

    // Filter out previous errored messages from history
    const validHistory = messages.filter(m => !m.error && m.role !== 'system');
    const convo: any[] = [
      ...(systemMessage.trim() ? [{ role: 'system' as const, content: systemMessage.trim() }] : []),
      ...validHistory.map(m => {
        if (m.images && m.images.length > 0) {
          return { role: m.role, content: m.content, images: m.images };
        }
        return { role: m.role, content: m.content };
      }),
      { role: 'user' as const, content: textToSend, ...(attachedImages.length > 0 ? { images: attachedImages } : {}) },
    ];

    if (retryText === undefined) {
      setMessages(prev => [...prev, { role: 'user', content: textToSend, images: attachedImages.length > 0 ? [...attachedImages] : undefined }]);
      setUserMessage('');
      setAttachedImages([]);
    }

    setSending(true);
    setLatency(null);
    setError('');

    const sessionId = crypto.randomUUID();
    pushLog('INFO', `Sending request to model: ${selectedModel}`, { model: selectedModel, payload: convo }, sessionId);

    const started = performance.now();
    try {
      const token = localStorage.getItem('admin_token');
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
        body: JSON.stringify({ model: selectedModel, messages: convo, stream: false }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      const elapsed = Math.round(performance.now() - started);

      if (!res.ok) {
        const raw = data?.error?.message || data?.error?.message === '' ? data?.error?.message : data?.error;
        const msg = typeof raw === 'string' ? raw : `Request failed (${res.status})`;
        setMessages(prev => [...prev, { role: 'assistant', content: msg, error: true }]);
        setLatency(elapsed);
        setError(msg);
        pushLog('ERROR', `Request failed with status ${res.status}`, { error: data?.error || data, status: res.status, elapsedMs: elapsed }, sessionId);
        return;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (content === undefined || content === null) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Model returned an empty response.', error: true }]);
        setLatency(elapsed);
        return;
      }

      const { thinking, cleanContent } = parseThinkingAndContent(String(content));
      setMessages(prev => [...prev, { role: 'assistant', content: cleanContent || String(content), thinking }]);
      setLatency(elapsed);
      pushLog('SUCCESS', `Received successful response in ${elapsed}ms`, { data, elapsedMs: elapsed }, sessionId);
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? 'Request timed out after 90s — the provider may be slow or rate-limited. Try another model.'
        : (err?.message || 'Network error — could not reach the backend.');
      setMessages(prev => [...prev, { role: 'assistant', content: msg, error: true }]);
      setError(msg);
      pushLog('ERROR', `Network error or timeout`, { message: msg, error: err?.message }, sessionId);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    if (speakingIndex !== null) {
      window.speechSynthesis?.cancel();
      setSpeakingIndex(null);
    }
    setMessages([]);
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

  const toggleThinking = (index: number) => {
    setExpandedThinking(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Filtered models based on active capability tab
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

  const inputLen = String(userMessage || '').length;
  const totalLen = inputLen + (systemMessage?.length || 0);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: 'var(--color-text-main)', background: 'transparent' }}>
      <style>{`
        .testGrid { display: grid; grid-template-columns: 360px 1fr; gap: 22px; align-items: start; }
        .testCard { background: var(--color-card-bg, #15191E); border: 1px solid var(--color-border, #262C34); border-radius: 18px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05); }
        .testHead { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .testHeadIcon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; background: var(--color-primary-soft, #1F2733); color: var(--color-primary, #EF4444); border: 1px solid rgba(239,68,68,0.2); }
        .testHead h3 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
        .testHead p { margin: 2px 0 0; font-size: 12px; color: var(--color-text-muted, #9AA3AF); }
        .fieldLabel { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-muted, #9AA3AF); margin-bottom: 7px; }
        
        .capTabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .capTab { font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--color-border, #262C34); background: var(--color-bg, #0B0D10); color: var(--color-text-muted, #9AA3AF); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s; }
        .capTab:hover { border-color: rgba(239,68,68,0.4); color: var(--color-text-main); }
        .capTab.active { background: rgba(239,68,68,0.12); color: #EF4444; border-color: #EF4444; }

        .select, .textarea { width: 100%; background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); border-radius: 11px; color: var(--color-text-main, #F2F4F7); font-size: 13.5px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .select { padding: 11px 14px; cursor: pointer; }
        .textarea { padding: 12px 14px; resize: vertical; line-height: 1.5; min-height: 88px; }
        .select:focus, .textarea:focus { border-color: var(--color-primary, #EF4444); box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
        .selectWrap { position: relative; display: flex; align-items: center; }
        .selectWrap .selIcon { position: absolute; left: 12px; pointer-events: none; color: var(--color-text-muted); display: flex; }
        .selectWrap .select { padding-left: 42px; }

        .modelHeroBanner { background: linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(31,39,51,0.4) 100%); border: 1px solid rgba(239,68,68,0.25); border-radius: 14px; padding: 12px 14px; margin-bottom: 16px; }
        .modelHeroTitle { font-size: 13.5px; font-weight: 700; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .modelHeroSub { font-size: 11.5px; color: var(--color-text-muted); margin-top: 3px; font-family: monospace; }
        
        .capsRow { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .capBadge { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
        .capBadge.text { background: rgba(59,130,246,0.14); color: #60A5FA; border: 1px solid rgba(59,130,246,0.3); }
        .capBadge.reasoning { background: rgba(168,85,247,0.14); color: #C084FC; border: 1px solid rgba(168,85,247,0.35); }
        .capBadge.vision { background: rgba(16,185,129,0.14); color: #34D399; border: 1px solid rgba(16,185,129,0.3); }
        .capBadge.audio { background: rgba(245,158,11,0.14); color: #FBBF24; border: 1px solid rgba(245,158,11,0.3); }
        .capBadge.image { background: rgba(236,72,153,0.14); color: #F472B6; border: 1px solid rgba(236,72,153,0.3); }
        .capBadge.video { background: rgba(244,63,94,0.14); color: #FB7185; border: 1px solid rgba(244,63,94,0.3); }

        .modelInfo { margin-top: 14px; padding: 12px 14px; background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); border-radius: 12px; }
        .modelInfoRow { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; padding: 4px 0; }
        .modelInfoLabel { display: flex; align-items: center; gap: 6px; color: var(--color-text-muted, #9AA3AF); }
        .modelInfoVal { font-weight: 600; color: var(--color-text-main, #F2F4F7); }

        .presetBtns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .presetBtn { font-size: 11px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--color-border, #262C34); background: transparent; color: var(--color-text-muted, #9AA3AF); cursor: pointer; transition: all 0.15s; }
        .presetBtn:hover, .presetBtn.active { border-color: var(--color-primary, #EF4444); color: var(--color-primary, #EF4444); background: rgba(239,68,68,0.07); }

        .chatCard { display: flex; flex-direction: column; min-height: 640px; }
        .chatScroll { flex: 1; overflow-y: auto; min-height: 380px; max-height: 560px; display: flex; flex-direction: column; gap: 14px; padding-right: 4px; }
        .bubble { display: flex; gap: 10px; align-items: flex-start; max-width: 92%; animation: rise 0.22s ease; }
        .bubble.user { align-self: flex-end; flex-direction: row-reverse; }
        .bubbleAvatar { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--color-border, #262C34); background: var(--color-bg, #0B0D10); color: var(--color-text-muted); }
        .bubble.user .bubbleAvatar { background: var(--color-primary-soft, #1F2733); color: var(--color-primary, #EF4444); border-color: rgba(239,68,68,0.25); }
        .bubbleBody { background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); border-radius: 14px; padding: 12px 14px; font-size: 13.5px; line-height: 1.6; word-break: break-word; white-space: pre-wrap; }
        .bubble.user .bubbleBody { background: var(--color-primary-soft, #1F2733); border-color: rgba(239,68,68,0.22); }
        .bubbleBody.error { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.06); color: #F87171; }
        
        .thinkingBox { margin-bottom: 8px; border: 1px solid rgba(168,85,247,0.3); background: rgba(168,85,247,0.05); border-radius: 10px; overflow: hidden; font-size: 12.5px; }
        .thinkingHeader { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: rgba(168,85,247,0.1); color: #C084FC; font-weight: 600; cursor: pointer; }
        .thinkingContent { padding: 10px; color: #D8B4FE; border-top: 1px dashed rgba(168,85,247,0.2); font-size: 12px; font-family: monospace; white-space: pre-wrap; line-height: 1.5; max-height: 220px; overflow-y: auto; }

        .bubbleImgs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .bubbleImg { max-width: 180px; max-height: 140px; border-radius: 8px; border: 1px solid var(--color-border); object-fit: cover; }

        .bubbleMeta { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .bubbleRole { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-muted, #9AA3AF); }
        .iconActionBtn { background: transparent; border: none; color: var(--color-text-muted, #9AA3AF); cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; gap: 3px; font-size: 11px; border-radius: 6px; transition: all 0.15s; }
        .iconActionBtn:hover { color: var(--color-primary, #EF4444); background: rgba(239,68,68,0.08); }
        .iconActionBtn.active { color: #10B981; }

        .composer { border-top: 1px dashed var(--color-border, #262C34); padding-top: 16px; margin-top: 16px; }
        .attachedPreviews { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
        .attachedItem { position: relative; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; border: 1px solid var(--color-primary); }
        .attachedItem img { width: 100%; height: 100%; object-fit: cover; }
        .removeImgBtn { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .toolbarRow { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; gap: 10px; }
        .toolBtns { display: flex; align-items: center; gap: 8px; }
        .toolBtn { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 8px 12px; border-radius: 10px; background: var(--color-bg, #0B0D10); border: 1px solid var(--color-border, #262C34); color: var(--color-text-muted); cursor: pointer; transition: all 0.15s; }
        .toolBtn:hover { border-color: rgba(239,68,68,0.5); color: var(--color-text-main); }
        .toolBtn.recording { background: rgba(239,68,68,0.18); border-color: #EF4444; color: #EF4444; animation: pulseRed 1.5s infinite; }
        .toolBtn.hasVision { border-color: rgba(52,211,153,0.4); color: #34D399; }
        
        .sendBtn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 12px; background: var(--color-primary, #EF4444); color: #fff; border: 1px solid var(--color-primary); font-weight: 700; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 14px rgba(239,68,68,0.28); transition: all 0.2s; flex-shrink: 0; }
        .sendBtn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); box-shadow: 0 6px 18px rgba(239,68,68,0.34); }
        .sendBtn:disabled { opacity: 0.55; cursor: not-allowed; }
        .clearBtn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; border-radius: 12px; background: transparent; color: var(--color-text-muted); border: 1px solid var(--color-border, #262C34); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .clearBtn:hover { color: #F87171; border-color: rgba(239,68,68,0.4); }

        .statusChip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 5px 11px; border-radius: 999px; margin-top: 12px; }
        .statusChip.ok { background: rgba(16,185,129,0.12); color: #10B981; border: 1px solid rgba(16,185,129,0.3); }
        .statusChip.err { background: rgba(239,68,68,0.12); color: #F87171; border: 1px solid rgba(239,68,68,0.3); }
        .statusChip.idle { background: var(--color-bg, #0B0D10); color: var(--color-text-muted); border: 1px solid var(--color-border, #262C34); }

        @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseRed { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
        @keyframes blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
        .typing { display: inline-flex; align-items: center; gap: 4px; padding: 4px 0; }
        .typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-muted); animation: blink 1.2s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        @media (max-width: 960px) { .testGrid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="testGrid">
        {/* ── LEFT: Model Config & Capabilities ── */}
        <div className="testCard">
          <div className="testHead">
            <div className="testHeadIcon"><Cpu size={18} /></div>
            <div>
              <h3>Model Capabilities & Config</h3>
              <p>Filter by modality and tune model settings</p>
            </div>
          </div>

          {/* Capabilities Filter Tabs */}
          <label className="fieldLabel">Filter by Capability</label>
          <div className="capTabs">
            <button
              className={`capTab ${activeCapFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCapFilter('all')}
            >
              <Layers size={12} /> All ({models.length})
            </button>
            <button
              className={`capTab ${activeCapFilter === 'text' ? 'active' : ''}`}
              onClick={() => setActiveCapFilter('text')}
            >
              <MessageSquare size={12} /> Text ({models.filter(m => m.text).length})
            </button>
            <button
              className={`capTab ${activeCapFilter === 'reasoning' ? 'active' : ''}`}
              onClick={() => setActiveCapFilter('reasoning')}
            >
              <Brain size={12} /> Reasoning ({models.filter(m => m.reasoning).length})
            </button>
            <button
              className={`capTab ${activeCapFilter === 'vision' ? 'active' : ''}`}
              onClick={() => setActiveCapFilter('vision')}
            >
              <Eye size={12} /> Vision ({models.filter(m => m.vision).length})
            </button>
            <button
              className={`capTab ${activeCapFilter === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveCapFilter('audio')}
            >
              <Mic size={12} /> Audio ({models.filter(m => m.audio).length})
            </button>
            <button
              className={`capTab ${activeCapFilter === 'image' ? 'active' : ''}`}
              onClick={() => setActiveCapFilter('image')}
            >
              <ImageIcon size={12} /> Image Gen ({models.filter(m => m.image).length})
            </button>
            <button
              className={`capTab ${activeCapFilter === 'video' ? 'active' : ''}`}
              onClick={() => setActiveCapFilter('video')}
            >
              <Film size={12} /> Video ({models.filter(m => m.video).length})
            </button>
          </div>

          <label className="fieldLabel">Select AI Model</label>
          <div className="selectWrap">
            <span className="selIcon"><Sparkles size={16} /></span>
            <select
              className="select"
              value={selectedModel}
              onChange={e => {
                setSelectedModel(e.target.value);
                setLatency(null);
                setError('');
                pushLog('INFO', `User changed model selection to: ${e.target.value}`, { newModel: e.target.value });
              }}
            >
              {loadingModels ? (
                <option>Loading models…</option>
              ) : filteredModels.length === 0 ? (
                <option>No models found for this capability filter</option>
              ) : (
                filteredModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.provider}
                  </option>
                ))
              )}
            </select>
          </div>

          {currentModel && (
            <div style={{ marginTop: 14 }}>
              {/* Model Capability Badges Highlight */}
              <div className="modelHeroBanner">
                <div className="modelHeroTitle">
                  <span>{currentModel.name}</span>
                  <span style={{ fontSize: 11, background: 'rgba(239,68,68,0.2)', color: '#EF4444', padding: '2px 7px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)' }}>
                    {currentModel.provider}
                  </span>
                </div>
                <div className="modelHeroSub">{currentModel.id}</div>

                <div className="capsRow">
                  {currentModel.text && <span className="capBadge text"><MessageSquare size={10} /> Text</span>}
                  {currentModel.reasoning && <span className="capBadge reasoning"><Brain size={10} /> Reasoning</span>}
                  {currentModel.vision && <span className="capBadge vision"><Eye size={10} /> Vision</span>}
                  {currentModel.audio && <span className="capBadge audio"><Mic size={10} /> Voice / Audio</span>}
                  {currentModel.image && <span className="capBadge image"><ImageIcon size={10} /> Image Gen</span>}
                  {currentModel.video && <span className="capBadge video"><Film size={10} /> Video</span>}
                </div>
              </div>

              <div className="modelInfo">
                <div className="modelInfoRow">
                  <span className="modelInfoLabel"><Bot size={13} /> Model ID</span>
                  <span className="modelInfoVal">{currentModel.id}</span>
                </div>
                <div className="modelInfoRow">
                  <span className="modelInfoLabel"><Key size={13} /> Provider</span>
                  <span className="modelInfoVal">{currentModel.provider}</span>
                </div>
                <div className="modelInfoRow">
                  <span className="modelInfoLabel"><ArrowDownRight size={13} /> Context</span>
                  <span className="modelInfoVal">
                    {currentModel.contextWindow
                      ? (currentModel.contextWindow.includes('k') || currentModel.contextWindow.includes('M') ? currentModel.contextWindow : `${currentModel.contextWindow} tokens`)
                      : '—'}
                  </span>
                </div>
                <div className="modelInfoRow">
                  <span className="modelInfoLabel"><TerminalSquare size={13} /> Access</span>
                  <span className="modelInfoVal">{currentModel.access || 'Standard'}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <label className="fieldLabel">System Prompt Preset</label>
            <textarea
              className="textarea"
              rows={3}
              value={systemMessage}
              onChange={e => setSystemMessage(e.target.value)}
              placeholder="Set instructions for model behavior…"
            />
            <div className="presetBtns">
              {PRESET_SYSTEM_MESSAGES.map((p, i) => (
                <button
                  key={i}
                  className={`presetBtn ${systemMessage === p.text ? 'active' : ''}`}
                  onClick={() => setSystemMessage(p.text)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Chat & Testing Interactive Section ── */}
        <div className="testCard chatCard">
          {/* Header showing Selected Model & Active Modalities */}
          <div className="testHead" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="testHeadIcon"><Bot size={18} /></div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 16 }}>{currentModel ? currentModel.name : 'Model Chat'}</h3>
                  {currentModel && (
                    <span style={{ fontSize: 11, background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '1px 8px', borderRadius: 999, border: '1px solid rgba(239,68,68,0.3)', fontWeight: 600 }}>
                      {currentModel.provider}
                    </span>
                  )}
                </div>
                {currentModel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{messages.length} messages ·</span>
                    {currentModel.text && <span className="capBadge text" style={{ fontSize: 9.5, padding: '1px 6px' }}><MessageSquare size={9} /> Text</span>}
                    {currentModel.reasoning && <span className="capBadge reasoning" style={{ fontSize: 9.5, padding: '1px 6px' }}><Brain size={9} /> Reasoning</span>}
                    {currentModel.vision && <span className="capBadge vision" style={{ fontSize: 9.5, padding: '1px 6px' }}><Eye size={9} /> Vision</span>}
                    {currentModel.audio && <span className="capBadge audio" style={{ fontSize: 9.5, padding: '1px 6px' }}><Mic size={9} /> Voice</span>}
                    {currentModel.image && <span className="capBadge image" style={{ fontSize: 9.5, padding: '1px 6px' }}><ImageIcon size={9} /> Image Gen</span>}
                  </div>
                )}
              </div>
            </div>
            <button className="clearBtn" onClick={clearChat} disabled={messages.length === 0}>
              <Trash2 size={14} /> Clear Chat
            </button>
          </div>

          <div className="chatScroll" ref={chatBoxRef}>
            {messages.length === 0 && !sending && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                <div style={{ width: 58, height: 58, borderRadius: 18, background: 'var(--color-primary-soft, #1F2733)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Sparkles size={26} style={{ color: 'var(--color-primary, #EF4444)' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-main)', marginBottom: 6 }}>
                  Test {currentModel ? currentModel.name : 'AI Models'}
                </div>
                <div style={{ fontSize: 13, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
                  Type a message, test speech-to-text with your microphone, attach images for vision analysis, or test multi-turn conversations.
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role === 'user' ? 'user' : ''}`}>
                <div className="bubbleAvatar">
                  {m.role === 'user' ? <UserIcon size={15} /> : <Bot size={15} />}
                </div>
                <div style={{ maxWidth: '100%' }}>
                  {/* User Images attached */}
                  {m.images && m.images.length > 0 && (
                    <div className="bubbleImgs">
                      {m.images.map((img, imgIdx) => (
                        <img key={imgIdx} src={img} alt="Attached input" className="bubbleImg" />
                      ))}
                    </div>
                  )}

                  {/* Thinking Process Accordion for Reasoning Models */}
                  {m.thinking && (
                    <div className="thinkingBox">
                      <div className="thinkingHeader" onClick={() => toggleThinking(i)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Brain size={13} /> Thinking Process
                        </span>
                        {expandedThinking[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                      {expandedThinking[i] && (
                        <div className="thinkingContent">{m.thinking}</div>
                      )}
                    </div>
                  )}

                  <div className={`bubbleBody ${m.error ? 'error' : ''}`}>{m.content}</div>

                  <div className="bubbleMeta">
                    <span className="bubbleRole">{m.role === 'user' ? 'user' : m.error ? 'model error' : 'model'}</span>
                    {i === messages.length - 1 && latency !== null && (
                      <span className="bubbleRole" style={{ color: latency < 4000 ? '#10B981' : '#F59E0B' }}>{latency}ms</span>
                    )}

                    {/* Retry button on error */}
                    {m.error && i > 0 && messages[i - 1]?.role === 'user' && (
                      <button
                        className="iconActionBtn"
                        onClick={() => sendMessage(messages[i - 1].content)}
                        title="Retry this message"
                        style={{ color: '#F87171' }}
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                    )}

                    {/* Speech / Audio output button */}
                    {!m.error && m.role === 'assistant' && (
                      <button
                        className={`iconActionBtn ${speakingIndex === i ? 'active' : ''}`}
                        onClick={() => speakText(i, m.content)}
                        title={speakingIndex === i ? 'Stop speaking' : 'Listen with Voice / Text-to-Speech'}
                      >
                        {speakingIndex === i ? <VolumeX size={13} color="#EF4444" /> : <Volume2 size={13} />}
                        <span>{speakingIndex === i ? 'Stop' : 'Listen'}</span>
                      </button>
                    )}

                    {!m.error && (
                      <button
                        className={`iconActionBtn ${copiedIndex === i ? 'active' : ''}`}
                        onClick={() => copyMessage(i, m.content)}
                        title="Copy"
                      >
                        {copiedIndex === i ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="bubble">
                <div className="bubbleAvatar"><Bot size={15} /></div>
                <div className="bubbleBody">
                  <div className="typing"><span /><span /><span /></div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── COMPOSER & MULTIMODAL CONTROLS ── */}
          <div className="composer">
            {/* Attached Image Previews */}
            {attachedImages.length > 0 && (
              <div className="attachedPreviews">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="attachedItem">
                    <img src={img} alt="Preview" />
                    <button className="removeImgBtn" onClick={() => removeAttachedImage(idx)} title="Remove">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              className="textarea"
              rows={3}
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder={
                isRecording
                  ? 'Listening to your voice… speak now…'
                  : currentModel?.vision
                  ? `Type a prompt or attach an image to test vision with ${currentModel.name}…`
                  : `Type a message to test ${currentModel ? currentModel.name : 'the model'}…`
              }
              disabled={sending}
            />

            {/* Hidden Image Input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />

            <div className="toolbarRow">
              <div className="toolBtns">
                {/* Voice / Mic Testing Button */}
                <button
                  type="button"
                  className={`toolBtn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  title="Test Voice Input (Speech-to-Text)"
                >
                  {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isRecording ? 'Recording…' : 'Voice Input'}</span>
                </button>

                {/* Vision / Image Attachment Button */}
                <button
                  type="button"
                  className={`toolBtn ${currentModel?.vision ? 'hasVision' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image to test vision"
                >
                  <ImageIcon size={14} />
                  <span>Attach Image {attachedImages.length > 0 ? `(${attachedImages.length})` : ''}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', fontSize: 11.5, color: 'var(--color-text-muted)', gap: 8, marginLeft: 6 }}>
                  <span>{inputLen} chars</span>
                  <span>·</span>
                  <span>Enter ↵ send · Shift+Enter newline</span>
                </div>
              </div>

              <button
                className="sendBtn"
                onClick={() => sendMessage()}
                disabled={sending || !selectedModel || (!userMessage.trim() && attachedImages.length === 0)}
              >
                {sending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                <span>{sending ? 'Streaming…' : 'Send Request'}</span>
              </button>
            </div>

            {!sending && (error || latency !== null) && (
              <div className={`statusChip ${error ? 'err' : 'ok'}`}>
                {error ? <><Info size={13} /> {typeof error === 'string' ? error.slice(0, 90) : 'Request failed'}</> : <><Check size={13} /> Completed in {latency}ms</>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}