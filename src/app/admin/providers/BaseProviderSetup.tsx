'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  RefreshCcw,
  Search,
  X,
  Check,
  Code,
  Play,
  Save,
  Eye,
  EyeOff,
  Plus,
  Pause,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
  Sliders,
  Sparkles,
  Copy,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import styles from '../admin.module.css';

export type SelectedModel = {
  originalId: string;
  originalName: string;
  name: string;
  id: string;
  text: boolean;
  image: boolean;
  vision: boolean;
  audio: boolean;
  reasoning: boolean;
  video: boolean;
  context_length?: number;
};

export interface BaseProviderSetupRef {
  testApi: (silent?: boolean) => Promise<boolean>;
}

export interface BaseProviderSetupProps {
  providerId: string;
  providerName: string;
  apiSlug: string;
  iconUrl?: string;
  getKeyUrl?: string;
  rawModelsUrl?: string;
  baseUrl?: string;
  placeholderKey?: string;
  index?: number;
  byokEnabled?: boolean;
  chatsEnabled?: boolean;
  onToggleByok?: () => void;
  onToggleChats?: () => void;
  onModelsUpdated?: () => void;
}

const DEMO_CALENDAR_IMAGE = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500';

const BaseProviderSetup = forwardRef<BaseProviderSetupRef, BaseProviderSetupProps>((
  {
    providerId,
    providerName,
    apiSlug,
    iconUrl,
    getKeyUrl,
    rawModelsUrl,
    baseUrl,
    placeholderKey = 'sk-...',
    index,
    byokEnabled,
    chatsEnabled,
    onToggleByok,
    onToggleChats,
    onModelsUpdated
  },
  ref
) => {
  const [apiKeys, setApiKeys] = useState<{ key: string; active: boolean }[]>([{ key: '', active: true }]);
  const [status, setStatus] = useState(false);
  const [showKeys, setShowKeys] = useState<boolean[]>([]);
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drawer top tabs: 'manage' | 'test'
  const [drawerTab, setDrawerTab] = useState<'manage' | 'test'>('manage');

  // Collapsible sections in Manage tab
  const [apiKeysCollapsed, setApiKeysCollapsed] = useState(false);
  const [availableModelsCollapsed, setAvailableModelsCollapsed] = useState(false);
  const [selectedModelsCollapsed, setSelectedModelsCollapsed] = useState(false);

  // Available models state
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Key testing state
  const [testing, setTesting] = useState<boolean[]>([]);
  const [testSuccesses, setTestSuccesses] = useState<(boolean | null)[]>([]);
  const [showKeyErrors, setShowKeyErrors] = useState<boolean[]>([]);
  const apiKeyRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Test Tab state
  const [testModelId, setTestModelId] = useState<string>('');
  const [testType, setTestType] = useState<'text' | 'vision' | 'image'>('text');
  const [testPrompt, setTestPrompt] = useState<string>('Hello! Please explain what you can do in 2 short sentences.');
  const [testImageUrl, setTestImageUrl] = useState<string>(DEMO_CALENDAR_IMAGE);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    ok: boolean;
    message: string;
    text?: string;
    imageUrl?: string;
    latencyMs?: number;
    status?: number;
  } | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || '') : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const testAllApiKeys = async (silent = false) => {
    let allPassed = true;
    for (let i = 0; i < apiKeys.length; i++) {
      const passed = await handleTestApi(i, silent);
      if (!passed) allPassed = false;
    }
    return allPassed;
  };

  useImperativeHandle(ref, () => ({
    testApi: testAllApiKeys
  }));

  const handleTestApi = async (keyIdx: number, silent = false) => {
    const keyObj = apiKeys[keyIdx];
    if (!keyObj || !keyObj.key) {
      if (!silent) {
        setShowKeyErrors(prev => { const n = [...prev]; n[keyIdx] = true; return n; });
        apiKeyRefs.current[keyIdx]?.focus();
      }
      setTestSuccesses(prev => { const n = [...prev]; n[keyIdx] = false; return n; });
      return false;
    }
    setShowKeyErrors(prev => { const n = [...prev]; n[keyIdx] = false; return n; });
    setTesting(prev => { const n = [...prev]; n[keyIdx] = true; return n; });
    setTestSuccesses(prev => { const n = [...prev]; n[keyIdx] = null; return n; });

    try {
      const res = await fetch(`/api/admin/${apiSlug}/models?key=${encodeURIComponent(keyObj.key)}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && (data?.data || Array.isArray(data))) {
        setTestSuccesses(prev => { const n = [...prev]; n[keyIdx] = true; return n; });
        return true;
      } else {
        setTestSuccesses(prev => { const n = [...prev]; n[keyIdx] = false; return n; });
        return false;
      }
    } catch {
      setTestSuccesses(prev => { const n = [...prev]; n[keyIdx] = false; return n; });
      return false;
    } finally {
      setTesting(prev => { const n = [...prev]; n[keyIdx] = false; return n; });
    }
  };

  useEffect(() => {
    fetch(`/api/admin/${apiSlug}`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.key) {
          try {
            const parsed = JSON.parse(data.key);
            if (Array.isArray(parsed)) {
              const mapped = parsed.map((k: any) => typeof k === 'string' ? { key: k, active: true } : { key: k.key || '', active: k.active ?? true });
              setApiKeys(mapped.length > 0 ? mapped : [{ key: '', active: true }]);
            } else {
              setApiKeys([{ key: data.key, active: true }]);
            }
          } catch {
            setApiKeys([{ key: data.key, active: true }]);
          }
        }
        if (data.status !== undefined) setStatus(data.status);
        if (data.models && Array.isArray(data.models)) {
          const normalized = data.models.map((m: any) =>
            typeof m === 'string'
              ? { originalId: m, originalName: m, name: m, id: m, text: true, image: false, vision: false, audio: false, reasoning: false, video: false }
              : {
                  ...m,
                  originalId: m.originalId || m.id || '',
                  originalName: m.originalName || m.name || m.id || '',
                  name: m.name || m.id || '',
                  id: m.id || m.originalId || '',
                  text: m.text ?? m.reasoning ?? true,
                  image: m.image ?? false,
                  vision: m.vision ?? m.image ?? false,
                  audio: m.audio ?? false,
                  reasoning: m.reasoning ?? false,
                  video: m.video ?? false
                }
          );
          setSelectedModels(normalized);
          if (normalized.length > 0 && !testModelId) {
            setTestModelId(normalized[0].originalId || normalized[0].id);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [apiSlug]);

  const handleFetchModels = async () => {
    setFetchingModels(true);
    try {
      const validKey = apiKeys.find(k => k.active && k.key.trim() !== '')?.key || '';
      const res = await fetch(`/api/admin/${apiSlug}/models?key=${encodeURIComponent(validKey)}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      const rawModels = Array.isArray(data.data) ? data.data : data;
      if (Array.isArray(rawModels)) {
        const sorted = rawModels.sort((a: any, b: any) => {
          const aMod = a.architecture?.modality || '';
          const bMod = b.architecture?.modality || '';
          const aIsText = aMod === 'text->text' || (!aMod.includes('image') && !aMod.includes('video') && !aMod.includes('audio'));
          const bIsText = bMod === 'text->text' || (!bMod.includes('image') && !bMod.includes('video') && !bMod.includes('audio'));
          if (aIsText && !bIsText) return -1;
          if (!aIsText && bIsText) return 1;
          return 0;
        });
        setAvailableModels(sorted);
        if (sorted.length > 0 && !testModelId) {
          setTestModelId(sorted[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      alert(`Failed to fetch ${providerName} models.`);
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = async (
    modelsToSave = selectedModels,
    keysToSave = apiKeys,
    shouldNotify = false,
    overrideStatus: boolean | null = null,
    showUiFeedback = shouldNotify
  ) => {
    if (showUiFeedback) setSaving(true);
    try {
      const validKeys = keysToSave.filter(k => k.key.trim() !== '');
      const keyString = JSON.stringify(validKeys.length > 0 ? validKeys : [{ key: '', active: true }]);
      const res = await fetch(`/api/admin/${apiSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          key: keyString,
          status: overrideStatus !== null ? overrideStatus : status,
          models: modelsToSave
        })
      });
      if (res.ok) {
        if (showUiFeedback) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
        if (shouldNotify && onModelsUpdated) onModelsUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showUiFeedback) setSaving(false);
    }
  };

  const toggleModelSelection = (model: any) => {
    const exists = selectedModels.find(m => m.originalId === model.id);
    let next: SelectedModel[];
    if (exists) {
      next = selectedModels.filter(m => m.originalId !== model.id);
    } else {
      const mod = model.architecture?.modality || '';
      const isImg = mod.includes('image') || mod.includes('vision');
      const isAud = mod.includes('audio');
      const isVid = mod.includes('video');
      next = [
        ...selectedModels,
        {
          originalId: model.id,
          originalName: model.name || model.id,
          name: model.name || model.id,
          id: model.id.split('/').pop()?.replace(/[^a-zA-Z0-9_-]/g, '_') || model.id,
          text: true,
          image: isImg,
          vision: isImg,
          audio: isAud,
          reasoning: false,
          video: isVid,
          context_length: model.context_length
        }
      ];
    }
    setSelectedModels(next);
    handleSave(next, apiKeys, false);
  };

  const updateSelectedModel = (originalId: string, field: keyof SelectedModel, value: any) => {
    const next = selectedModels.map(m => (m.originalId === originalId ? { ...m, [field]: value } : m));
    setSelectedModels(next);
    handleSave(next, apiKeys, false);
  };

  const handleDrawerClose = () => {
    handleSave(selectedModels, apiKeys, true, null, false);
    setIsDrawerOpen(false);
  };

  // Switch test type with default prompts
  const handleSelectTestType = (type: 'text' | 'vision' | 'image') => {
    setTestType(type);
    setTestResponse(null);
    if (type === 'text') {
      setTestPrompt('Hello! Please explain what you can do in 2 short sentences.');
    } else if (type === 'vision') {
      setTestPrompt('What do you see in this image? Describe its text, calendar, colors, and layout.');
      if (!testImageUrl) setTestImageUrl(DEMO_CALENDAR_IMAGE);
    } else if (type === 'image') {
      setTestPrompt('A futuristic city on Mars at sunrise with neon lights and flying vehicles, digital concept art');
    }
  };

  // Run Test execution
  const handleExecuteTest = async () => {
    const validKey = apiKeys.find(k => k.active && k.key.trim() !== '')?.key || apiKeys[0]?.key || '';
    if (!validKey) {
      setTestResponse({ ok: false, message: 'Please configure and activate an API key first' });
      return;
    }
    if (!testModelId) {
      setTestResponse({ ok: false, message: 'Please select a model from the dropdown to test' });
      return;
    }

    setIsSendingTest(true);
    setTestResponse(null);

    try {
      const res = await fetch('/api/admin/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          providerId,
          model: testModelId,
          originalId: testModelId,
          key: validKey,
          baseUrl,
          testType,
          prompt: testPrompt,
          imageUrl: testType === 'vision' ? testImageUrl : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResponse({
          ok: true,
          message: data.message || `${testType.toUpperCase()} test completed successfully!`,
          text: data.preview,
          imageUrl: data.generatedImageUrl,
          latencyMs: data.latencyMs,
          status: 200
        });
      } else {
        setTestResponse({
          ok: false,
          message: data.message || `Test failed with HTTP ${res.status}`,
          status: data.status || res.status,
          latencyMs: data.latencyMs
        });
      }
    } catch (e: any) {
      setTestResponse({ ok: false, message: e.message || 'Network error during test execution' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredAvailableModels = availableModels.filter(
    m => m.id.toLowerCase().includes(searchQuery.toLowerCase()) || m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute capabilities of currently chosen test model
  const currentTestModelObj = availableModels.find(m => m.id === testModelId) || selectedModels.find(m => (m.originalId || m.id) === testModelId);

  const getCapabilitiesList = (modelObj: any): string[] => {
    if (!modelObj) return ['Text'];
    const list: string[] = [];
    if (modelObj.text !== false) list.push('Text');
    if (modelObj.chat !== false) list.push('Chat');
    if (modelObj.vision || modelObj.architecture?.modality?.includes('vision')) list.push('Vision');
    if (modelObj.image || modelObj.architecture?.modality?.includes('image')) list.push('Image');
    if (modelObj.reasoning) list.push('Thinking');
    if (modelObj.audio || modelObj.architecture?.modality?.includes('audio')) list.push('Audio');
    if (modelObj.video || modelObj.architecture?.modality?.includes('video')) list.push('Video');
    return list.length > 0 ? list : ['Text'];
  };

  const testModelCapabilities = getCapabilitiesList(currentTestModelObj);
  const activeKeysCount = apiKeys.filter(k => k.key.trim()).length;

  if (loading) return null;

  return (
    <>
      {/* ===== OUTSIDE CARD (GRID) ===== */}
      <div
        style={{
          background: 'var(--color-card-bg)',
          border: `1px solid ${testSuccesses.includes(false) ? '#ef4444' : testSuccesses.includes(true) ? '#10b981' : 'var(--color-border)'}`,
          padding: '20px',
          borderRadius: '12px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          transition: 'border-color 0.3s'
        }}
      >
        {/* Card Header: Left has index/icon/name, Right has switch buttons stacked in a COLUMN */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {index !== undefined && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600, background: 'var(--color-bg-soft)', padding: '3px 8px', borderRadius: '6px' }}>
                #{index}
              </span>
            )}
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img
                src={iconUrl || `https://www.google.com/s2/favicons?domain=${apiSlug}.com&sz=128`}
                alt={providerName}
                style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>{providerName}</span>
          </div>

          {/* RIGHT SIDE SWITCHES: Arranged in a COLUMN so they don't overflow! */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            {/* Status ON/OFF Switch */}
            <div
              onClick={() => {
                const newStatus = !status;
                setStatus(newStatus);
                handleSave(selectedModels, apiKeys, true, newStatus, false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                background: status ? '#10b98115' : 'var(--color-bg-soft)',
                padding: '3px 8px',
                borderRadius: '16px',
                border: `1px solid ${status ? '#10b98144' : 'var(--color-border)'}`
              }}
              title={`Provider ${status ? 'ON' : 'OFF'}`}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: status ? '#10b981' : 'var(--color-text-muted)' }}>
                {status ? 'ON' : 'OFF'}
              </span>
              <div
                style={{
                  width: '26px',
                  height: '15px',
                  background: status ? '#10b981' : 'var(--color-text-muted)',
                  borderRadius: '16px',
                  position: 'relative',
                  transition: 'background 0.3s'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '1.5px',
                    left: status ? '12.5px' : '1.5px',
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
            </div>

            {/* BYOK Toggle Switch */}
            {onToggleByok !== undefined && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleByok();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  background: (byokEnabled ?? true) ? '#10b98115' : 'var(--color-bg-soft)',
                  padding: '3px 8px',
                  borderRadius: '16px',
                  border: `1px solid ${(byokEnabled ?? true) ? '#10b98144' : 'var(--color-border)'}`
                }}
                title="Toggle BYOK visibility for users"
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: (byokEnabled ?? true) ? '#10b981' : 'var(--color-text-muted)' }}>
                  BYOK {(byokEnabled ?? true) ? 'ON' : 'OFF'}
                </span>
                <div
                  style={{
                    width: '26px',
                    height: '15px',
                    background: (byokEnabled ?? true) ? '#10b981' : 'var(--color-text-muted)',
                    borderRadius: '16px',
                    position: 'relative',
                    transition: 'background 0.3s'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.5px',
                      left: (byokEnabled ?? true) ? '12.5px' : '1.5px',
                      width: '12px',
                      height: '12px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Chats Toggle Switch */}
            {onToggleChats !== undefined && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleChats();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  background: (chatsEnabled ?? true) ? '#3b82f615' : 'var(--color-bg-soft)',
                  padding: '3px 8px',
                  borderRadius: '16px',
                  border: `1px solid ${(chatsEnabled ?? true) ? '#3b82f644' : 'var(--color-border)'}`
                }}
                title="Toggle provider visibility in CheapChats"
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: (chatsEnabled ?? true) ? '#60a5fa' : 'var(--color-text-muted)' }}>
                  Chats {(chatsEnabled ?? true) ? 'ON' : 'OFF'}
                </span>
                <div
                  style={{
                    width: '26px',
                    height: '15px',
                    background: (chatsEnabled ?? true) ? '#3b82f6' : 'var(--color-text-muted)',
                    borderRadius: '16px',
                    position: 'relative',
                    transition: 'background 0.3s'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.5px',
                      left: (chatsEnabled ?? true) ? '12.5px' : '1.5px',
                      width: '12px',
                      height: '12px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Body: Summary Badges */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
          <span
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'var(--color-bg-soft)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              fontWeight: 600
            }}
          >
            {activeKeysCount} API Key{activeKeysCount !== 1 ? 's' : ''}
          </span>
          <span
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'var(--color-bg-soft)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              fontWeight: 600
            }}
          >
            Selected Models: {selectedModels.length}
          </span>
        </div>

        {/* Action Button: Opens Drawer */}
        <button
          className="btn-secondary"
          onClick={() => {
            setDrawerTab('manage');
            setApiKeysCollapsed(false);
            setAvailableModelsCollapsed(false);
            setSelectedModelsCollapsed(false);
            setIsDrawerOpen(true);
          }}
          style={{ padding: '9px 16px', width: '100%', justifyContent: 'center', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}
        >
          Select Models &amp; Keys ({selectedModels.length})
        </button>
      </div>

      {/* ===== RIGHT-SIDE DRAWER ===== */}
      {isDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'flex-end',
            backdropFilter: 'blur(2px)'
          }}
          onClick={handleDrawerClose}
        >
          <div
            style={{
              width: '540px',
              maxWidth: '94vw',
              background: 'var(--color-card-bg)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-5px 0 25px rgba(0,0,0,0.15)',
              borderLeft: '1px solid var(--color-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* DRAWER HEADER WITH TABS: MANAGE vs TEST */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img
                    src={iconUrl || `https://www.google.com/s2/favicons?domain=${apiSlug}.com&sz=128`}
                    alt={providerName}
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>{providerName}</h2>
              </div>

              {/* TWO TABS IN HEADER: MANAGE & TEST */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-input-bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => setDrawerTab('manage')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: drawerTab === 'manage' ? 'var(--color-primary)' : 'transparent',
                    color: drawerTab === 'manage' ? '#ffffff' : 'var(--color-text-muted)',
                    transition: 'all 0.15s'
                  }}
                >
                  <Sliders size={13} /> Manage
                </button>
                <button
                  onClick={() => setDrawerTab('test')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: drawerTab === 'test' ? 'var(--color-primary)' : 'transparent',
                    color: drawerTab === 'test' ? '#ffffff' : 'var(--color-text-muted)',
                    transition: 'all 0.15s'
                  }}
                >
                  <Sparkles size={13} /> Test
                </button>
              </div>

              {/* Close Button */}
              <button onClick={handleDrawerClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }} title="Close Sheet">
                <X size={18} />
              </button>
            </div>

            {/* ============================================================ */}
            {/* VIEW 1: MANAGE TAB                                           */}
            {/* ============================================================ */}
            {drawerTab === 'manage' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* 1. COLLAPSIBLE API KEYS SECTION */}
                <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-card-bg)' }}>
                  <div
                    onClick={() => setApiKeysCollapsed(!apiKeysCollapsed)}
                    style={{
                      padding: '10px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: 'var(--color-bg-soft)',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {apiKeysCollapsed ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronUp size={15} color="var(--color-text-muted)" />}
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        API Keys ({apiKeys.filter(k => k.key.trim()).length})
                      </span>
                      {apiKeysCollapsed && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          • {apiKeys.filter(k => k.active && k.key.trim()).length} Active
                        </span>
                      )}
                    </div>
                    {getKeyUrl && (
                      <a
                        href={getKeyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        Get Key ↗
                      </a>
                    )}
                  </div>

                  {!apiKeysCollapsed && (
                    <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {apiKeys.map((keyObj, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: keyObj.active ? 1 : 0.6 }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <input
                                ref={el => { apiKeyRefs.current[index] = el; }}
                                type={showKeys[index] ? 'text' : 'password'}
                                value={keyObj.key}
                                onChange={(e) => {
                                  const n = [...apiKeys];
                                  n[index] = { ...n[index], key: e.target.value };
                                  setApiKeys(n);
                                }}
                                placeholder={placeholderKey}
                                disabled={!keyObj.active}
                                autoComplete="new-password"
                                style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '7px 32px 7px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px', fontFamily: 'monospace' }}
                              />
                              <button
                                className="btn-secondary"
                                onClick={() => { const n = [...showKeys]; n[index] = !n[index]; setShowKeys(n); }}
                                style={{ position: 'absolute', right: '4px', background: 'transparent', border: 'none', padding: '4px', color: 'var(--color-text-muted)' }}
                                title={showKeys[index] ? 'Hide Key' : 'Show Key'}
                              >
                                {showKeys[index] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>

                            <button
                              className="btn-secondary"
                              onClick={() => {
                                const n = [...apiKeys];
                                n[index] = { ...n[index], active: !n[index].active };
                                setApiKeys(n);
                              }}
                              style={{ padding: '7px 9px', display: 'flex', alignItems: 'center', height: '32px', color: keyObj.active ? '#eab308' : '#10b981' }}
                              title={keyObj.active ? 'Pause Key' : 'Resume Key'}
                            >
                              {keyObj.active ? <Pause size={13} /> : <Play size={13} />}
                            </button>

                            <button
                              className="btn-secondary"
                              onClick={() => handleTestApi(index, false)}
                              disabled={testing[index] || !keyObj.active}
                              style={{ padding: '7px 9px', display: 'flex', alignItems: 'center', height: '32px', color: testSuccesses[index] === true ? '#10b981' : testSuccesses[index] === false ? '#ef4444' : 'inherit' }}
                              title="Test Key"
                            >
                              {testing[index] ? <RefreshCcw size={13} className={styles.spin} /> : testSuccesses[index] === true ? <Check size={13} /> : testSuccesses[index] === false ? <X size={13} /> : <Play size={13} />}
                            </button>

                            {index > 0 && (
                              <button
                                className="btn-secondary"
                                onClick={() => {
                                  const nk = [...apiKeys]; nk.splice(index, 1); setApiKeys(nk);
                                  const nt = [...testing]; nt.splice(index, 1); setTesting(nt);
                                  const nts = [...testSuccesses]; nts.splice(index, 1); setTestSuccesses(nts);
                                }}
                                style={{ padding: '7px 8px', display: 'flex', alignItems: 'center', height: '32px', color: '#ef4444' }}
                                title="Remove Key"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => setApiKeys([...apiKeys, { key: '', active: true }])}
                          style={{ flex: 1, justifyContent: 'center', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px' }}
                        >
                          <Plus size={12} /> Add Key
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => handleSave(selectedModels, apiKeys, true)}
                          disabled={saving}
                          style={{ flex: 1, justifyContent: 'center', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px', color: saved ? '#10b981' : undefined, borderColor: saved ? '#10b981' : undefined }}
                          title="Save All Keys"
                        >
                          {saving ? <RefreshCcw size={12} className={styles.spin} /> : (saved ? <Check size={12} /> : <Save size={12} />)} {saved ? 'Saved!' : 'Save Keys'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. COLLAPSIBLE AVAILABLE MODELS SELECTION */}
                <div
                  style={{
                    flex: availableModelsCollapsed ? 'none' : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--color-border)',
                    minHeight: availableModelsCollapsed ? 'auto' : '180px'
                  }}
                >
                  <div
                    onClick={() => setAvailableModelsCollapsed(!availableModelsCollapsed)}
                    style={{
                      padding: '8px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: 'var(--color-bg-soft)',
                      borderBottom: availableModelsCollapsed ? 'none' : '1px solid var(--color-border)',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {availableModelsCollapsed ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronUp size={15} color="var(--color-text-muted)" />}
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        Available Models ({availableModels.length})
                      </span>
                      {availableModelsCollapsed && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          • {selectedModels.length} Selected
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {availableModelsCollapsed ? 'Click to expand' : 'Click to collapse'}
                    </span>
                  </div>

                  {!availableModelsCollapsed && (
                    <>
                      <div style={{ padding: '8px 18px', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--color-card-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={13} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--color-text-muted)' }} />
                          <input
                            type="text"
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 10px 5px 30px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                          />
                        </div>
                        <button
                          className="btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFetchModels();
                          }}
                          disabled={fetchingModels}
                          style={{ padding: '5px 10px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', height: '28px' }}
                        >
                          <RefreshCcw size={12} className={fetchingModels ? styles.spin : ''} />
                          {fetchingModels ? 'Loading...' : 'Load API'}
                        </button>
                        {rawModelsUrl && (
                          <a
                            href={rawModelsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="btn-secondary"
                            style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', height: '28px', color: 'var(--color-text-muted)' }}
                            title="View Raw JSON"
                          >
                            <Code size={13} />
                          </a>
                        )}
                      </div>

                      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {filteredAvailableModels.map(model => {
                          const isSelected = selectedModels.some(m => m.originalId === model.id);
                          return (
                            <label
                              key={model.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                background: isSelected ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-bg-soft)',
                                border: '1px solid',
                                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleModelSelection(model)}
                                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.name}</span>
                                  {model.context_length ? (
                                    <span style={{ fontSize: '10px', color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                                      {Math.round(model.context_length / 1000)}K
                                    </span>
                                  ) : null}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.id}</span>
                                  <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', opacity: 0.8, textTransform: 'uppercase' }}>
                                    {model.architecture?.modality || 'TEXT'}
                                  </span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                        {availableModels.length === 0 && !fetchingModels && (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                            Click &quot;Load API&quot; to fetch models from {providerName}.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* 3. COLLAPSIBLE SELECTED MODELS SECTION */}
                <div
                  style={{
                    background: 'var(--color-bg-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: availableModelsCollapsed && !selectedModelsCollapsed ? 1 : undefined,
                    maxHeight: selectedModelsCollapsed ? 'auto' : (availableModelsCollapsed ? 'none' : '40%'),
                    minHeight: selectedModelsCollapsed ? 'auto' : '150px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    onClick={() => setSelectedModelsCollapsed(!selectedModelsCollapsed)}
                    style={{
                      padding: '8px 18px',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: 'var(--color-card-bg)',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedModelsCollapsed ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronUp size={15} color="var(--color-text-muted)" />}
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>Selected Models</span>
                      <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>
                        {selectedModels.length}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {selectedModelsCollapsed ? 'Click to expand' : 'Click to collapse'}
                    </span>
                  </div>

                  {!selectedModelsCollapsed && (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedModels.map(model => (
                        <div key={model.originalId} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '8px 10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span>Original: </span>
                              <strong style={{ color: 'var(--color-text-main)', fontFamily: 'monospace', fontSize: '11px' }}>{model.originalId}</strong>
                            </div>
                            <button
                              onClick={() => toggleModelSelection({ id: model.originalId })}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                              title="Remove"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Custom Name</label>
                              <input
                                type="text"
                                value={model.name}
                                onChange={(e) => updateSelectedModel(model.originalId, 'name', e.target.value)}
                                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                              />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Custom ID</label>
                              <input
                                type="text"
                                value={model.id}
                                onChange={(e) => updateSelectedModel(model.originalId, 'id', e.target.value)}
                                style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={model.text} onChange={(e) => updateSelectedModel(model.originalId, 'text', e.target.checked)} />
                              Text
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={model.image} onChange={(e) => updateSelectedModel(model.originalId, 'image', e.target.checked)} />
                              Image
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={model.vision} onChange={(e) => updateSelectedModel(model.originalId, 'vision', e.target.checked)} />
                              Vision
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={model.audio} onChange={(e) => updateSelectedModel(model.originalId, 'audio', e.target.checked)} />
                              Audio
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={model.reasoning} onChange={(e) => updateSelectedModel(model.originalId, 'reasoning', e.target.checked)} />
                              Reasoning
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={model.video} onChange={(e) => updateSelectedModel(model.originalId, 'video', e.target.checked)} />
                              Video
                            </label>
                          </div>
                        </div>
                      ))}
                      {selectedModels.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '12px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                          No models selected yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Save & Close */}
                <div style={{ padding: '10px 18px', borderTop: '1px solid var(--color-border)', background: 'var(--color-card-bg)' }}>
                  <button
                    className="btn-primary"
                    onClick={handleDrawerClose}
                    style={{ width: '100%', justifyContent: 'center', padding: '8px 14px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Check size={14} /> Save &amp; Close Drawer
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 2: TEST TAB (Interactive Model Tester & Playground)     */}
            {/* ============================================================ */}
            {drawerTab === 'test' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '16px 18px', gap: '14px', background: 'var(--color-bg-base)' }}>
                {/* 1. MODEL SELECTION & RELOAD BAR */}
                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Choose Model To Test
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Key: {activeKeysCount > 0 ? 'Active' : 'Missing'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={testModelId}
                      onChange={(e) => {
                        setTestModelId(e.target.value);
                        setTestResponse(null);
                      }}
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '7px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-main)', outline: 'none' }}
                    >
                      <option value="" disabled>Select model...</option>
                      {(() => {
                        const combined = [
                          ...availableModels.map(m => ({ id: m.id, name: m.name || m.id })),
                          ...selectedModels.filter(sm => !availableModels.some(am => am.id === (sm.originalId || sm.id))).map(sm => ({ id: sm.originalId || sm.id, name: sm.name || sm.id }))
                        ];
                        return combined.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id})
                          </option>
                        ));
                      })()}
                    </select>

                    {/* Reload models button */}
                    <button
                      className="btn-secondary"
                      onClick={handleFetchModels}
                      disabled={fetchingModels}
                      style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '33px' }}
                      title="Reload models from API"
                    >
                      <RefreshCcw size={13} className={fetchingModels ? styles.spin : ''} />
                      {fetchingModels ? 'Loading...' : 'Reload'}
                    </button>
                  </div>

                  {/* Capabilities display (grey pills separated by commas) */}
                  {testModelId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Capabilities:</span>
                      {testModelCapabilities.map((cap, i) => (
                        <React.Fragment key={cap}>
                          <span
                            style={{
                              fontSize: '11px',
                              background: 'var(--color-bg-soft)',
                              border: '1px solid var(--color-border)',
                              padding: '1px 7px',
                              borderRadius: '4px',
                              color: 'var(--color-text-muted)',
                              fontWeight: 500
                            }}
                          >
                            {cap}
                          </span>
                          {i < testModelCapabilities.length - 1 && <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>,</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. TEST TYPE SELECTOR (Text vs Vision vs Image) */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleSelectTestType('text')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: testType === 'text' ? 'var(--color-primary)' : 'var(--color-border)',
                      background: testType === 'text' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-card-bg)',
                      color: testType === 'text' ? 'var(--color-primary)' : 'var(--color-text-main)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <MessageSquare size={14} /> Text Test
                  </button>
                  <button
                    onClick={() => handleSelectTestType('vision')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: testType === 'vision' ? 'var(--color-primary)' : 'var(--color-border)',
                      background: testType === 'vision' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-card-bg)',
                      color: testType === 'vision' ? 'var(--color-primary)' : 'var(--color-text-main)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={14} /> Vision Test
                  </button>
                  <button
                    onClick={() => handleSelectTestType('image')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: testType === 'image' ? 'var(--color-primary)' : 'var(--color-border)',
                      background: testType === 'image' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-card-bg)',
                      color: testType === 'image' ? 'var(--color-primary)' : 'var(--color-text-main)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <ImageIcon size={14} /> Image Gen
                  </button>
                </div>

                {/* 3. PROMPT & VISION IMAGE INPUT AREA */}
                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* If Vision Mode, show demo image */}
                  {testType === 'vision' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--color-bg-soft)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>DEMO IMAGE (FOR VISION ANALYSIS)</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-primary)' }}>Calendar &amp; Landscape Sample</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img
                          src={testImageUrl}
                          alt="Vision Demo"
                          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="text"
                            value={testImageUrl}
                            onChange={(e) => setTestImageUrl(e.target.value)}
                            placeholder="Image URL..."
                            style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>You can edit or change the image URL above</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Textarea for Prompt */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      {testType === 'text' ? 'Test Prompt' : testType === 'vision' ? 'Vision Prompt' : 'Image Generation Prompt'}
                    </label>
                    <textarea
                      rows={3}
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      placeholder="Type prompt here..."
                      style={{
                        width: '100%',
                        background: 'var(--color-input-bg)',
                        border: '1px solid var(--color-border)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        color: 'var(--color-text-main)',
                        fontSize: '12px',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Send Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-primary"
                      onClick={handleExecuteTest}
                      disabled={isSendingTest || !testPrompt.trim() || !testModelId}
                      style={{
                        padding: '7px 16px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600,
                        cursor: isSendingTest ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSendingTest ? <RefreshCcw size={13} className={styles.spin} /> : <Send size={13} />}
                      {isSendingTest ? 'Sending Request...' : 'Send Request'}
                    </button>
                  </div>
                </div>

                {/* 4. MODEL RESPONSE BOX */}
                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>Response Output</span>
                      {testResponse?.latencyMs && (
                        <span style={{ fontSize: '10px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '1px 6px', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                          {testResponse.latencyMs}ms
                        </span>
                      )}
                      {testResponse?.status && (
                        <span
                          style={{
                            fontSize: '10px',
                            background: testResponse.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: testResponse.ok ? '#10b981' : '#ef4444',
                            border: `1px solid ${testResponse.ok ? '#10b98133' : '#ef444433'}`,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          HTTP {testResponse.status}
                        </span>
                      )}
                    </div>

                    {testResponse?.text && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(testResponse.text || '');
                          setCopiedResponse(true);
                          setTimeout(() => setCopiedResponse(false), 2000);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                      >
                        {copiedResponse ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        {copiedResponse ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>

                  {/* Response Body */}
                  {isSendingTest && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                      <RefreshCcw size={20} className={styles.spin} />
                      <span style={{ fontSize: '12px' }}>Waiting for model response...</span>
                    </div>
                  )}

                  {!isSendingTest && !testResponse && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', border: '1px dashed var(--color-border)', borderRadius: '6px' }}>
                      Click <strong>&quot;Send Request&quot;</strong> above to test {testModelId || providerName} and see the model output here.
                    </div>
                  )}

                  {!isSendingTest && testResponse && (
                    <>
                      {testResponse.ok ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* If image generated */}
                          {testResponse.imageUrl && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <img
                                src={testResponse.imageUrl}
                                alt="Generated"
                                style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--color-border)', maxHeight: '300px', objectFit: 'contain' }}
                              />
                              <a href={testResponse.imageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--color-primary)' }}>
                                Open full size ↗
                              </a>
                            </div>
                          )}

                          {/* Text response */}
                          {testResponse.text && (
                            <div style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', color: 'var(--color-text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '250px', overflowY: 'auto' }}>
                              {testResponse.text}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '10px 12px', color: '#ef4444', fontSize: '12px' }}>
                          <div style={{ fontWeight: 600, marginBottom: '2px' }}>Request Failed:</div>
                          {testResponse.message}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

BaseProviderSetup.displayName = 'BaseProviderSetup';
export default BaseProviderSetup;
