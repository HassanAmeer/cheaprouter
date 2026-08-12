'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, AlertTriangle, Plus, X, ChevronDown, ChevronRight, Globe, Layers, RefreshCw, Play, CheckCircle2, XCircle, Trash2, Search, Filter, Settings2, Upload, ImageIcon, Type, Brain, Eye, Video, Mic, Database, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import OpenRouterSetup from './OpenRouterSetup';

type Model = { id: string; name: string; originalId?: string; text?: boolean; reasoning?: boolean; vision?: boolean; image?: boolean; video?: boolean; embedding?: boolean; audio?: boolean; contextWindow?: string; tokenLimit?: string; access?: string; inputPrice?: string; outputPrice?: string; showOnLandingPage?: boolean; icon?: string; landingPagePriority?: number; };
type Header = { id: string; key: string; value: string };
type Provider = { id: string; name: string; status: boolean; key: string; priority: number; models: Model[]; baseUrl?: string; useModelsApi?: boolean; modelsApiLink?: string; headers?: Header[]; isCustom?: boolean; apiFormat?: string; icon?: string };

const PRESET_ICONS = [
  { name: 'Google Gemini', url: 'https://cdn.simpleicons.org/google/4285F4' },
  { name: 'Groq', url: 'https://cdn.simpleicons.org/groq/F55036' },
  { name: 'OpenRouter', url: 'https://api.iconify.design/lucide:router.svg' },
  { name: 'Mistral AI', url: 'https://cdn.simpleicons.org/mistral/F26625' },
  { name: 'Nvidia NIM', url: 'https://cdn.simpleicons.org/nvidia/76B900' },
  { name: 'SiliconFlow', url: 'https://api.iconify.design/lucide:cpu.svg' },
  { name: 'ModelScope', url: 'https://api.iconify.design/lucide:microscope.svg' },
  { name: 'HuggingFace', url: 'https://cdn.simpleicons.org/huggingface/FFD21E' },
  { name: 'GitHub Models', url: 'https://cdn.simpleicons.org/github/181717' },
  { name: 'OpenCode', url: 'https://api.iconify.design/lucide:code.svg' },
  { name: 'Cohere', url: 'https://cdn.simpleicons.org/cohere/39594D' },
  { name: 'Cerebras', url: 'https://api.iconify.design/lucide:brain.svg' },
  { name: 'SambaNova', url: 'https://api.iconify.design/lucide:server.svg' },
  { name: 'AI Horde', url: 'https://api.iconify.design/lucide:users.svg' },
  { name: 'Pollinations', url: 'https://api.iconify.design/lucide:flower.svg' },
  { name: 'Bytez', url: 'https://api.iconify.design/lucide:zap.svg' },
  { name: 'TokenRouter', url: 'https://api.iconify.design/lucide:network.svg' },
  { name: 'Zai', url: 'https://api.iconify.design/lucide:box.svg' },
  { name: 'KiloCode', url: 'https://api.iconify.design/lucide:code-2.svg' },
  { name: 'UnoRouter', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'LLM7', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'Poixe', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'Zenmux', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'Routeway', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'AgnesAI', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'TokenHarbor', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'OpenAI', url: 'https://cdn.simpleicons.org/openai/10A37F' },
  { name: 'Anthropic', url: 'https://cdn.simpleicons.org/anthropic/D97757' },
  { name: 'DeepSeek', url: 'https://cdn.simpleicons.org/deepseek/4D6BFE' },
  { name: 'Perplexity', url: 'https://cdn.simpleicons.org/perplexity/22B8CD' },
  { name: 'Together', url: 'https://cdn.simpleicons.org/togetherai/0A66C2' },
  { name: 'Fireworks', url: 'https://cdn.simpleicons.org/fireworks/000000' },
  { name: 'XAI', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'Novita', url: 'https://api.iconify.design/lucide:sparkles.svg' },
  { name: 'AIMLAPI', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'AmazonBedrock', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'Hyperbolic', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'Moonshot', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'ai&', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'ClineCode', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'StepFun', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'AnyRouter', url: 'https://api.iconify.design/lucide:bot.svg' },
  { name: 'Meta', url: 'https://cdn.simpleicons.org/meta/0467DF' },
  { name: 'xAI', url: 'https://cdn.simpleicons.org/x/000000' },
  { name: 'Generic AI', url: 'https://api.iconify.design/lucide:bot.svg' }
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGlobalModels, setShowGlobalModels] = useState(true);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [iconPickerOpenFor, setIconPickerOpenFor] = useState<string | null>(null);

  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [landingSearchQuery, setLandingSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    capabilities: [] as string[],
    access: [] as string[],
    providers: [] as string[]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [showAddCustomModel, setShowAddCustomModel] = useState(false);
  const [customModelProviderId, setCustomModelProviderId] = useState('');
  const [customModelOriginalId, setCustomModelOriginalId] = useState('');
  const [customModelName, setCustomModelName] = useState('');
  const [customModelShowingId, setCustomModelShowingId] = useState('');
  const [customModelText, setCustomModelText] = useState(true);
  const [customModelReasoning, setCustomModelReasoning] = useState(false);
  const [customModelVision, setCustomModelVision] = useState(false);
  const [customModelImage, setCustomModelImage] = useState(false);
  const [customModelVideo, setCustomModelVideo] = useState(false);
  const [customModelEmbedding, setCustomModelEmbedding] = useState(false);
  const [customModelAudio, setCustomModelAudio] = useState(false);
  const [customModelTokenLimit, setCustomModelTokenLimit] = useState('');
  const [customModelContextWindow, setCustomModelContextWindow] = useState('');
  const [customModelAccess, setCustomModelAccess] = useState('Free');
  const [customModelInputPrice, setCustomModelInputPrice] = useState('');
  const [customModelOutputPrice, setCustomModelOutputPrice] = useState('');

  const handleBulkDelete = () => {
    if (selectedModels.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedModels.size} selected models?`)) return;

    setProviders(prevProviders => prevProviders.map(p => {
      return {
        ...p,
        models: p.models.filter(m => !selectedModels.has(`${p.id}-${m.id}`))
      };
    }));
    setSelectedModels(new Set());
    setSelectedModels(new Set());
    setSaved(false);
  };

  const handleAddLandingPage = () => {
    if (selectedModels.size === 0) return;
    
    setProviders(prevProviders => prevProviders.map(p => {
      return {
        ...p,
        models: p.models.map(m => selectedModels.has(`${p.id}-${m.id}`) ? { ...m, showOnLandingPage: true } : m)
      };
    }));
    setSelectedModels(new Set());
    setSaved(false);
  };

  const handleRemoveLandingPage = (providerId: string, modelId: string) => {
    setProviders(prevProviders => prevProviders.map(p => p.id === providerId ? {
      ...p,
      models: p.models.map(m => m.id === modelId ? { ...m, showOnLandingPage: false } : m)
    } : p));
    setSaved(false);
  };

  const handleRemoveAllLandingPage = () => {
    setProviders(prevProviders => prevProviders.map(p => ({
      ...p,
      models: p.models.map(m => ({ ...m, showOnLandingPage: false }))
    })));
    setSaved(false);
  };

  const handleAddCustomModel = () => {
    if (!customModelProviderId || !customModelOriginalId.trim() || !customModelName.trim()) return;
    const targetProvider = providers.find(p => p.id === customModelProviderId);
    if (!targetProvider) return;
    const showingId = customModelShowingId.trim() || customModelOriginalId.trim();
    const newModel: Model = {
      id: showingId,
      name: customModelName,
      originalId: customModelOriginalId.trim(),
      text: customModelText,
      reasoning: customModelReasoning,
      vision: customModelVision,
      image: customModelImage,
      video: customModelVideo,
      embedding: customModelEmbedding,
      audio: customModelAudio,
      tokenLimit: customModelTokenLimit || 'Unlimited',
      contextWindow: customModelContextWindow || 'Dynamic',
      access: customModelAccess,
      inputPrice: customModelInputPrice || 'Variable',
      outputPrice: customModelOutputPrice || 'Variable',
      showOnLandingPage: false
    };
    setProviders(prevProviders => prevProviders.map(p => p.id === customModelProviderId ? { ...p, models: [...p.models, newModel] } : p));
    setCustomModelProviderId('');
    setCustomModelOriginalId('');
    setCustomModelName('');
    setCustomModelShowingId('');
    setCustomModelText(true);
    setCustomModelReasoning(false);
    setCustomModelVision(false);
    setCustomModelImage(false);
    setCustomModelVideo(false);
    setCustomModelEmbedding(false);
    setCustomModelAudio(false);
    setCustomModelTokenLimit('');
    setCustomModelContextWindow('');
    setCustomModelAccess('Free');
    setCustomModelInputPrice('');
    setCustomModelOutputPrice('');
    setShowAddCustomModel(false);
    setSaved(false);
  };

  const handleTestModel = async (providerId: string, model: Model) => {
    const key = `${providerId}-${model.id}`;
    setTestingModelId(key);
    try {
      const provider = providers.find(p => p.id === providerId);
      const res = await fetch('/api/admin/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          providerId,
          originalId: model.originalId || model.id,
          key: provider?.key || '',
          baseUrl: provider?.baseUrl || ''
        })
      });
      const data = await res.json();
      if (data.ok) {
        setTestResults(prev => ({
          ...prev,
          [key]: { success: true, message: data.message || '200 OK - Active' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [key]: { success: false, message: data.message || `HTTP ${data.status}` }
        }));
      }
    } catch (e: any) {
      setTestResults(prev => ({
        ...prev,
        [key]: { success: false, message: e?.message || 'Connection Error' }
      }));
    } finally {
      setTestingModelId(null);
    }
  };

  const handleModelUpdateInGlobalSummary = (providerId: string, modelIndex: number, field: string, value: any) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        const nextModels = [...(p.models || [])];
        nextModels[modelIndex] = { ...nextModels[modelIndex], [field]: value };
        return { ...p, models: nextModels };
      }
      return p;
    }));
  };
  const handleUpdateProviderIcon = async (providerId: string, iconUrl: string) => {
    const nextProviders = providers.map(p => p.id === providerId ? { ...p, icon: iconUrl } : p);
    setProviders(nextProviders);
    try {
      await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(nextProviders)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error('Failed to save icon:', e);
    }
  };

  const handleUpdateModelIcon = async (providerId: string, modelId: string, iconUrl: string) => {
    const nextProviders = providers.map(p => {
      if (p.id !== providerId) return p;
      return {
        ...p,
        models: p.models.map(m => m.id === modelId ? { ...m, icon: iconUrl } : m)
      };
    });
    setProviders(nextProviders);
    try {
      await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(nextProviders)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error('Failed to save icon:', e);
    }
  };
  
  const handleMoveLandingPageModel = async (currentIndex: number, direction: 'up' | 'down') => {
    const lpModels = providers
      .flatMap(p => p.models.map(m => ({ ...m, providerId: p.id })))
      .filter(m => m.showOnLandingPage)
      .sort((a, b) => (a.landingPagePriority || 0) - (b.landingPagePriority || 0));

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === lpModels.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    const reordered = [...lpModels];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const priorityUpdates: Record<string, { modelId: string, priority: number }[]> = {};
    
    reordered.forEach((m, idx) => {
      if (!priorityUpdates[m.providerId]) priorityUpdates[m.providerId] = [];
      priorityUpdates[m.providerId].push({ modelId: m.id, priority: idx + 1 });
    });

    const nextProviders = providers.map(p => {
      if (!priorityUpdates[p.id]) return p;
      return {
        ...p,
        models: p.models.map(m => {
          const update = priorityUpdates[p.id].find(u => u.modelId === m.id);
          return update ? { ...m, landingPagePriority: update.priority } : m;
        })
      };
    });
    setProviders(nextProviders);

    try {
      await fetch('/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(nextProviders)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error('Failed to update priority', e);
    }
  };
  
  // State for Add Provider Modal
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvId, setNewProvId] = useState('');
  const [newProvName, setNewProvName] = useState('');
  const [newProvIcon, setNewProvIcon] = useState('');
  const [newProvBaseUrl, setNewProvBaseUrl] = useState('');
  const [newProvApiFormat, setNewProvApiFormat] = useState('OpenAI Compatible');
  const [newProvUseModelsApi, setNewProvUseModelsApi] = useState(false);
  const [newProvModelsApiLink, setNewProvModelsApiLink] = useState('');
  const [newProvModels, setNewProvModels] = useState<Model[]>([]);
  const [newProvKey, setNewProvKey] = useState('');
  const [newProvHeaders, setNewProvHeaders] = useState<Header[]>([]);

  // State for Add Model
  const [addingModelTo, setAddingModelTo] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [newModelOriginalId, setNewModelOriginalId] = useState('');
  const [newModelShowingId, setNewModelShowingId] = useState('');
  const [newModelReasoning, setNewModelReasoning] = useState(false);
  const [newModelImage, setNewModelImage] = useState(false);

  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    const next = new Set(expandedProviders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedProviders(next);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || '') : '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let list: Provider[] = [];
      const headers: Record<string, string> = getAuthHeaders();
      const res = await fetch('/api/admin/providers', { headers });
      if (res.ok) {
        const data = await res.json();
        const rawArray = Array.isArray(data) ? data : (data && Array.isArray(data.providers) ? data.providers : []);
        list = rawArray.map((p: any) => ({
          id: p.id,
          name: p.name,
          icon: p.icon || '',
          status: p.status ?? true,
          key: p.key || '',
          priority: p.priority ?? 0,
          baseUrl: p.base_url ?? p.baseUrl,
          useModelsApi: p.use_models_api ?? p.useModelsApi ?? false,
          modelsApiLink: p.models_api_link ?? p.modelsApiLink ?? '',
          apiFormat: p.api_format ?? p.apiFormat,
          isCustom: p.is_custom ?? p.isCustom ?? false,
          headers: p.headers || [],
          models: Array.isArray(p.models)
            ? p.models.map((m: any) =>
                typeof m === 'string'
                  ? { id: m, name: m, originalId: m, reasoning: false, image: false, tokenLimit: 'Unlimited', access: 'Free' }
                  : {
                      ...m,
                      id: m.id || m.originalId || '',
                      name: m.name || m.originalName || m.id || '',
                      originalId: m.originalId || m.id || '',
                      reasoning: m.reasoning ?? m.text ?? false,
                      image: m.image || m.vision || false,
                      tokenLimit: m.tokenLimit || 'Unlimited',
                      access: m.access || 'Free',
                      showOnLandingPage: m.showOnLandingPage || false
                    }
              )
            : []
        }));
      }

      // Also check OpenRouter config
      const openRouterRes = await fetch('/api/admin/openrouter', { headers });
      if (openRouterRes.ok) {
        const openRouterData = await openRouterRes.json();
        if (openRouterData && Array.isArray(openRouterData.models)) {
          const openRouterModels = openRouterData.models.map((m: any) =>
            typeof m === 'string'
              ? { id: m, name: m, originalId: m, reasoning: true, image: false, tokenLimit: 'Unlimited', access: 'Free' }
              : {
                  ...m,
                  id: m.id || m.originalId || '',
                  name: m.name || m.originalName || m.id || '',
                  originalId: m.originalId || m.id || '',
                  reasoning: m.text ?? m.reasoning ?? true,
                  image: m.image || m.vision || false,
                  tokenLimit: m.tokenLimit || 'Unlimited',
                  access: m.access || 'Free'
                }
          );

          const idx = list.findIndex(p => p.id === 'ap_openrouter' || p.id === 'openrouter');
          if (idx >= 0) {
            list[idx].models = openRouterModels;
            if (openRouterData.key) list[idx].key = openRouterData.key;
            if (openRouterData.status !== undefined) list[idx].status = openRouterData.status;
          } else {
            list.push({
              id: 'ap_openrouter',
              name: 'OpenRouter',
              status: openRouterData.status ?? true,
              key: openRouterData.key || '',
              priority: 10,
              models: openRouterModels,
              isCustom: true
            });
          }
        }
      }

      setProviders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const toggleProvider = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, status: !p.status } : p));
    setSaved(false);
  };

  const updateKey = (id: string, newKey: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, key: newKey } : p));
    setSaved(false);
  };

  const updateBaseUrl = (id: string, newBaseUrl: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, baseUrl: newBaseUrl } : p));
    setSaved(false);
  };

  const updateApiFormat = (id: string, newFormat: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, apiFormat: newFormat } : p));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch('/api/admin/providers', {
        method: 'PUT',
        headers,
        body: JSON.stringify(providers)
      });

      const openRouterProv = providers.find(p => p.id === 'ap_openrouter' || p.id === 'openrouter');
      if (openRouterProv) {
        await fetch('/api/admin/openrouter', {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            key: openRouterProv.key,
            status: openRouterProv.status,
            models: openRouterProv.models
          })
        });
      }

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProvider = () => {
    if (!newProvName.trim()) return;

    let initialModels: Model[] = [];
    if (!newProvUseModelsApi) {
      initialModels = newProvModels.filter(m => m.name.trim() && m.id.trim()).map(m => ({
        ...m,
        id: m.id.trim(),
        name: m.name.trim(),
        originalId: m.originalId?.trim() || m.id.trim()
      }));
    }

    const providerId = newProvId.trim() ? newProvId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') : `prov_${Date.now()}`;

    setProviders([...providers, {
      id: providerId,
      name: newProvName,
      icon: newProvIcon.trim() || undefined,
      status: false,
      key: newProvKey.trim(),
      priority: providers.length + 1,
      models: initialModels,
      baseUrl: newProvBaseUrl.trim() || undefined,
      apiFormat: newProvApiFormat,
      useModelsApi: newProvUseModelsApi,
      modelsApiLink: newProvModelsApiLink.trim() || undefined,
      headers: newProvHeaders,
      isCustom: true
    }]);
    setNewProvId('');
    setNewProvName('');
    setNewProvIcon('');
    setNewProvBaseUrl('');
    setNewProvApiFormat('OpenAI Compatible');
    setNewProvKey('');
    setNewProvHeaders([]);
    setNewProvUseModelsApi(false);
    setNewProvModelsApiLink('');
    setNewProvModels([]);
    setShowAddProvider(false);
    setSaved(false);
  };

  const handleAddModel = (provId: string) => {
    if (!newModelName.trim() || !newModelOriginalId.trim() || !newModelShowingId.trim()) return;
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, models: [...p.models, { id: newModelShowingId, name: newModelName, originalId: newModelOriginalId, reasoning: newModelReasoning, image: newModelImage }] };
      }
      return p;
    }));
    setNewModelName('');
    setNewModelOriginalId('');
    setNewModelShowingId('');
    setNewModelReasoning(false);
    setNewModelImage(false);
    setAddingModelTo(null);
    setSaved(false);
  };

  const handleRemoveModel = (provId: string, modelId: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, models: p.models.filter(m => m.id !== modelId) };
      }
      return p;
    }));
    setSaved(false);
  };

  const handleAddHeader = (provId: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, headers: [...(p.headers || []), { id: `h_${Date.now()}`, key: '', value: '' }] };
      }
      return p;
    }));
    setSaved(false);
  };

  const handleUpdateHeader = (provId: string, headerId: string, field: 'key' | 'value', val: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, headers: (p.headers || []).map(h => h.id === headerId ? { ...h, [field]: val } : h) };
      }
      return p;
    }));
    setSaved(false);
  };

  const handleRemoveHeader = (provId: string, headerId: string) => {
    setProviders(providers.map(p => {
      if (p.id === provId) {
        return { ...p, headers: (p.headers || []).filter(h => h.id !== headerId) };
      }
      return p;
    }));
    setSaved(false);
  };


  const renderProviderTile = (provider: Provider, isCustomGroup: boolean) => (
    <div key={provider.id} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer', background: expandedProviders.has(provider.id) ? 'var(--color-bg-soft)' : 'transparent' }}
        onClick={() => toggleExpanded(provider.id)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{provider.name}</span>
          {isCustomGroup && <span style={{ fontSize: '11px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Custom</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              checked={provider.status} 
              onChange={() => toggleProvider(provider.id)} 
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </div>
      
      {expandedProviders.has(provider.id) && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Root API Key</label>
            <input 
              type="password" 
              value={provider.key}
              onChange={(e) => updateKey(provider.id, e.target.value)}
              placeholder={`Enter ${provider.name} API Key`}
              disabled={!provider.status}
              autoComplete="new-password"
              style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontFamily: 'monospace', fontSize: '13px' }}
            />
          </div>

          {isCustomGroup && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider API Format</label>
                <select 
                  value={provider.apiFormat || 'OpenAI Compatible'}
                  onChange={(e) => updateApiFormat(provider.id, e.target.value)}
                  disabled={!provider.status}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px', appearance: 'auto' }}
                >
                  <option value="OpenAI Compatible">OpenAI Compatible</option>
                  <option value="OpenAI Responses">OpenAI Responses</option>
                  <option value="Anthropic Messages">Anthropic Messages</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Base URL</label>
                <input 
                  type="text" 
                  value={provider.baseUrl || ''}
                  onChange={(e) => updateBaseUrl(provider.id, e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1"
                  disabled={!provider.status}
                  autoComplete="off"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }}
                />
              </div>

              {/* Headers Management */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Headers (Optional)</label>
                  <button 
                    onClick={() => handleAddHeader(provider.id)}
                    disabled={!provider.status}
                    style={{ background: 'none', border: 'none', color: provider.status ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Header
                  </button>
                </div>
                {provider.headers?.map(header => (
                  <div key={header.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text"
                      value={header.key}
                      onChange={(e) => handleUpdateHeader(provider.id, header.id, 'key', e.target.value)}
                      placeholder="Header Name (e.g. Authorization)"
                      disabled={!provider.status}
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '12px' }}
                    />
                    <input 
                      type="text"
                      value={header.value}
                      onChange={(e) => handleUpdateHeader(provider.id, header.id, 'value', e.target.value)}
                      placeholder="Value (e.g. Bearer sk-...)"
                      disabled={!provider.status}
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '12px' }}
                    />
                    <button onClick={() => handleRemoveHeader(provider.id, header.id)} disabled={!provider.status} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', padding: '4px' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Model Management */}
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 600 }}>Models Configuration</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Use API Link</span>
                <label className={styles.toggleSwitch}>
                  <input 
                    type="checkbox" 
                    checked={provider.useModelsApi || false} 
                    onChange={() => {
                      setProviders(providers.map(p => p.id === provider.id ? { ...p, useModelsApi: !(p.useModelsApi || false) } : p));
                      setSaved(false);
                    }} 
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>

            {provider.useModelsApi ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Models List API Link</label>
                <input 
                  type="text" 
                  value={provider.modelsApiLink || ''}
                  onChange={(e) => {
                    setProviders(providers.map(p => p.id === provider.id ? { ...p, modelsApiLink: e.target.value } : p));
                    setSaved(false);
                  }}
                  placeholder="e.g. https://api.openai.com/v1/models"
                  disabled={!provider.status}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }}
                />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 600 }}>Active Models</span>
                  <button 
                    onClick={() => setAddingModelTo(provider.id)}
                    disabled={!provider.status}
                    style={{ background: 'none', border: 'none', color: provider.status ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Model
                  </button>
                </div>

                {addingModelTo === provider.id && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', padding: '12px', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Original Model ID</label>
                        <input 
                          type="text"
                          value={newModelOriginalId}
                          onChange={(e) => setNewModelOriginalId(e.target.value)}
                          placeholder="e.g. gpt-4"
                          autoFocus
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model Name</label>
                        <input 
                          type="text"
                          value={newModelName}
                          onChange={(e) => setNewModelName(e.target.value)}
                          placeholder="e.g. GPT-4"
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model ID</label>
                      <input 
                        type="text"
                        value={newModelShowingId}
                        onChange={(e) => setNewModelShowingId(e.target.value)}
                        placeholder="e.g. cr-gpt-4"
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>* Users calling our API will use this ID, but will see the "Showing Model Name" in the UI.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newModelReasoning} onChange={(e) => setNewModelReasoning(e.target.checked)} />
                        Reasoning
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newModelImage} onChange={(e) => setNewModelImage(e.target.checked)} />
                        Image
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button onClick={() => setAddingModelTo(null)} style={{ background: 'transparent', color: 'var(--color-text-muted)', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => handleAddModel(provider.id)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Add Model</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {provider.models.map(model => (
                    <div key={model.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px', minWidth: '200px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>{model.name}</span>
                        <button onClick={() => handleRemoveModel(provider.id, model.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span><strong>Original ID:</strong> {model.originalId || model.id}</span>
                        <span><strong>Showing ID:</strong> {model.id}</span>
                        {(model.reasoning || model.image) && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                            {model.reasoning && <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>Reasoning</span>}
                            {model.image && <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>Image</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {provider.models.length === 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No models added.</span>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
  const allModelsListUnfiltered = providers.filter(p => p.status !== false).flatMap(p => (p.models || []).map((m, mIdx) => ({ providerId: p.id, providerName: p.name, mIdx, ...m })));
  const allModelsList = allModelsListUnfiltered.filter(m => {
    let match = true;

    if (activeFilters.providers.length > 0) {
      if (!activeFilters.providers.includes(m.providerId)) match = false;
    }
    if (activeFilters.access.length > 0) {
      if (!activeFilters.access.includes(m.access || 'Free')) match = false;
    }
    if (activeFilters.capabilities.length > 0) {
      const hasCap = activeFilters.capabilities.some(cap => m[cap as keyof Model]);
      if (!hasCap) match = false;
    }

    if (match && searchQuery) {
      const term = searchQuery.toLowerCase();
      match = (
        m.name.toLowerCase().includes(term) || 
        (m.originalId || m.id).toLowerCase().includes(term) || 
        m.id.toLowerCase().includes(term) ||
        m.providerName.toLowerCase().includes(term)
      );
    }
    
    return match;
  });
  const totalPages = Math.ceil(allModelsList.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [allModelsList.length, totalPages, currentPage]);

  const currentPageModels = allModelsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const allCurrentKeys = currentPageModels.map(m => `${m.providerId}-${m.id}`);
  const isAllSelected = allCurrentKeys.length > 0 && allCurrentKeys.every(k => selectedModels.has(k));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = new Set(selectedModels);
    if (e.target.checked) {
      allCurrentKeys.forEach(k => next.add(k));
    } else {
      allCurrentKeys.forEach(k => next.delete(k));
    }
    setSelectedModels(next);
  };

  const renderPagination = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Showing {allModelsList.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allModelsList.length)} of {allModelsList.length} models
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
          style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)', fontSize: '12px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
        >
          Previous
        </button>
        <span style={{ fontSize: '12px', color: 'var(--color-text-main)', fontWeight: 600, padding: '0 4px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage >= totalPages}
          style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text-main)', fontSize: '12px', fontWeight: 600, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const groupedCurrentPageModels: Record<string, { providerName: string; models: any[] }> = {};
  currentPageModels.forEach(m => {
    if (!groupedCurrentPageModels[m.providerId]) {
      groupedCurrentPageModels[m.providerId] = { providerName: m.providerName, models: [] };
    }
    groupedCurrentPageModels[m.providerId].models.push(m);
  });

  return (
    <div>
      {/* Top Header & Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Provider Routing & Keys</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Manage API keys and dynamically route models.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/providers/manage"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '8px', border: '1.5px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
          >
            <Plus size={15} /> Add & Manage Providers
          </Link>
          <button
            onClick={() => setShowAddCustomModel(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '8px', border: '1.5px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Settings2 size={15} /> Add Custom Model
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '8px' }}>
            <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading Providers...</span>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        </div>
      ) : (
        <>
          {/* Selected Models */}
          <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'visible', marginBottom: '32px' }}>
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)', borderTopLeftRadius: '11px', borderTopRightRadius: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, flex: 1 }}>
                  <Layers size={18} /> All Selected Models <span style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '13px' }}>({allModelsList.length})</span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px 12px', width: '100%', maxWidth: '350px' }}>
                    <Search size={14} style={{ color: 'var(--color-text-muted)', marginRight: '8px' }} />
                    <input 
                      type="text" 
                      placeholder="Search models or providers..." 
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--color-text-main)', width: '100%' }}
                    />
                    <button 
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: (activeFilters.capabilities.length > 0 || activeFilters.access.length > 0 || activeFilters.providers.length > 0) ? 'var(--color-primary, #3b82f6)' : 'var(--color-text-muted)' }}
                      title="Filter Models"
                    >
                      <Filter size={14} />
                    </button>
                  </div>
                  
                  {showFilterMenu && (
                    <div style={{ position: 'absolute', top: '100%', marginTop: '8px', zIndex: 100, background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Filter Models</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {(activeFilters.providers.length > 0 || activeFilters.capabilities.length > 0 || activeFilters.access.length > 0) && (
                            <button onClick={() => { setActiveFilters({ providers: [], capabilities: [], access: [] }); setSearchQuery(''); setCurrentPage(1); setShowFilterMenu(false); }} style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-main)' }}>
                              Clear All
                            </button>
                          )}
                          <button onClick={() => setShowFilterMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Providers</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {providers.map(p => (
                            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={activeFilters.providers.includes(p.id)} onChange={(e) => {
                                const next = e.target.checked ? [...activeFilters.providers, p.id] : activeFilters.providers.filter(id => id !== p.id);
                                setActiveFilters({...activeFilters, providers: next});
                                setCurrentPage(1);
                              }} style={{ cursor: 'pointer' }} />
                              {p.name}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Capabilities</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {['text', 'reasoning', 'vision', 'image', 'video', 'embedding', 'audio'].map(cap => (
                            <label key={cap} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={activeFilters.capabilities.includes(cap)} onChange={(e) => {
                                const next = e.target.checked ? [...activeFilters.capabilities, cap] : activeFilters.capabilities.filter(c => c !== cap);
                                setActiveFilters({...activeFilters, capabilities: next});
                                setCurrentPage(1);
                              }} style={{ cursor: 'pointer' }} />
                              <span style={{ textTransform: 'capitalize' }}>{cap}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleAddLandingPage}
                    disabled={selectedModels.size === 0}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px',
                      background: selectedModels.size > 0 ? 'var(--color-primary, #3b82f6)' : 'transparent',
                      color: selectedModels.size > 0 ? '#fff' : 'var(--color-text-muted)',
                      border: `1px solid ${selectedModels.size > 0 ? 'var(--color-primary, #3b82f6)' : 'var(--color-border)'}`,
                      fontSize: '12px', fontWeight: 600,
                      cursor: selectedModels.size > 0 ? 'pointer' : 'not-allowed',
                      opacity: selectedModels.size > 0 ? 1 : 0.5,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Globe size={14} /> Add to Landing Page ({selectedModels.size})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedModels.size === 0}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px',
                      background: selectedModels.size > 0 ? 'var(--color-danger, #ef4444)' : 'transparent',
                      color: selectedModels.size > 0 ? '#fff' : 'var(--color-text-muted)',
                      border: `1px solid ${selectedModels.size > 0 ? 'var(--color-danger, #ef4444)' : 'var(--color-border)'}`,
                      fontSize: '12px', fontWeight: 600,
                      cursor: selectedModels.size > 0 ? 'pointer' : 'not-allowed',
                      opacity: selectedModels.size > 0 ? 1 : 0.5,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={14} /> Delete Selected ({selectedModels.size})
                  </button>
                  <button 
                    onClick={() => fetchProviders()}
                    title="Reload Models" 
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    <RefreshCw size={14} className={loading ? styles.spin : ''} /> Reload
                  </button>
                </div>
              </div>

              {allModelsListUnfiltered.length === 0 ? (
                <div style={{ padding: '40px 20px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  No models selected yet. Click on the <strong>"Add & Manage Providers"</strong> button to select or configure models.
                </div>
              ) : allModelsList.length === 0 ? (
                <div style={{ padding: '40px 20px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  No models match your search for "{searchQuery}".
                </div>
              ) : (
                <>
                  {renderPagination()}

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <th style={{ padding: '10px 16px', width: '4%' }}>
                            <input 
                              type="checkbox" 
                              checked={isAllSelected}
                              onChange={handleSelectAll}
                              style={{ cursor: 'pointer' }}
                            />
                          </th>
                          <th style={{ padding: '10px 16px', fontWeight: 600, width: '15%' }}>Original Model ID</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '18%' }}>Custom Names</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '9%' }}>Context</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '12%' }}>Pricing (1M)</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, width: '25%' }}>Capabilities</th>
                          <th style={{ padding: '10px 16px', fontWeight: 600, width: '7%', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(groupedCurrentPageModels).map(([pId, group]) => (
                          <React.Fragment key={pId}>
                            {/* Provider Section Row */}
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <td colSpan={7} style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ 
                                    color: 'var(--color-primary, #ef4444)', 
                                    fontSize: '11px', 
                                    fontWeight: 700, 
                                    letterSpacing: '0.6px', 
                                    textTransform: 'uppercase'
                                  }}>
                                    {group.providerName}
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', opacity: 0.7, fontWeight: 500 }}>
                                    ({group.models.length} {group.models.length === 1 ? 'model' : 'models'})
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {/* Model Rows */}
                            {group.models.map((m) => {
                              const key = `${pId}-${m.id}`;
                              return (
                              <tr key={`${pId}-${m.mIdx}`} style={{ borderBottom: '1px solid var(--color-border)', background: selectedModels.has(key) ? 'var(--color-bg-soft)' : 'transparent' }}>
                                <td style={{ padding: '6px 16px' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={selectedModels.has(key)}
                                    onChange={(e) => {
                                      const next = new Set(selectedModels);
                                      if (e.target.checked) next.add(key);
                                      else next.delete(key);
                                      setSelectedModels(next);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </td>
                                <td style={{ padding: '6px 16px' }}>
                                  <code style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-main)', opacity: 0.9, background: 'rgba(255,255,255,0.04)', padding: '3px 7px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                    {m.originalId || m.id}
                                  </code>
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', width: '35px' }}>Name:</span>
                                      <input 
                                        type="text"
                                        value={m.name}
                                        onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'name', e.target.value)}
                                        placeholder="Showing Name"
                                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none', width: '100%' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', width: '35px' }}>ID:</span>
                                      <input 
                                        type="text"
                                        value={m.id}
                                        onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'id', e.target.value)}
                                        placeholder="Showing ID"
                                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none', width: '100%' }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input 
                                      type="number"
                                      value={m.contextWindow ? m.contextWindow.replace('K', '') : ''}
                                      onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'contextWindow', e.target.value ? `${e.target.value}K` : '')}
                                      placeholder="128"
                                      style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none', width: '50px' }}
                                    />
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>K</span>
                                  </div>
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', width: '22px' }}>In:</span>
                                      <input 
                                        type="number"
                                        value={m.inputPrice || ''}
                                        onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'inputPrice', e.target.value)}
                                        placeholder="0.00"
                                        step="0.0001"
                                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none', width: '60px' }}
                                      />
                                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>$</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', width: '22px' }}>Out:</span>
                                      <input 
                                        type="number"
                                        value={m.outputPrice || ''}
                                        onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, 'outputPrice', e.target.value)}
                                        placeholder="0.00"
                                        step="0.0001"
                                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none', width: '60px' }}
                                      />
                                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>$</span>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '4px 12px' }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%', minWidth: '150px' }}>
                                    {[
                                      { key: 'text', label: 'Text' },
                                      { key: 'reasoning', label: 'Reasoning' },
                                      { key: 'vision', label: 'Vision' },
                                      { key: 'image', label: 'Image' },
                                      { key: 'video', label: 'Video' },
                                      { key: 'embedding', label: 'Embedding' },
                                      { key: 'audio', label: 'Audio' }
                                    ].map(cap => (
                                      <label key={cap.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                                        <input 
                                          type="checkbox" 
                                          checked={!!m[cap.key as keyof Model]}
                                          onChange={(e) => handleModelUpdateInGlobalSummary(pId, m.mIdx, cap.key, e.target.checked)}
                                          style={{ cursor: 'pointer', transform: 'scale(0.85)' }}
                                        />
                                        {cap.label}
                                      </label>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ padding: '4px 16px', textAlign: 'right' }}>
                                  {testResults[`${pId}-${m.id}`] ? (
                                    <span style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '4px', 
                                      fontSize: '11px', 
                                      fontWeight: 600,
                                      color: testResults[`${pId}-${m.id}`].success ? '#10b981' : '#ef4444', 
                                      background: testResults[`${pId}-${m.id}`].success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                                      border: testResults[`${pId}-${m.id}`].success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '3px 8px', 
                                      borderRadius: '6px' 
                                    }}>
                                      {testResults[`${pId}-${m.id}`].success ? <CheckCircle2 size={12} /> : <XCircle size={12} />} 
                                      {testResults[`${pId}-${m.id}`].message}
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={() => handleTestModel(pId, m)}
                                      disabled={testingModelId === `${pId}-${m.id}`}
                                      style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '5px', 
                                        background: 'var(--color-bg-soft)', 
                                        border: '1px solid var(--color-border)', 
                                        color: 'var(--color-text-main)', 
                                        padding: '4px 12px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Play size={10} fill="currentColor" /> {testingModelId === `${pId}-${m.id}` ? 'Testing...' : 'Test'}
                                    </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {renderPagination()}
                </>
              )}
            </div>
        </>
      )}

      {/* Landing Page Models Section */}
      <hr style={{ margin: '40px 0', borderColor: 'var(--color-border)', opacity: 0.5 }} />
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Landing Page and API Models</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Models selected to be featured on the main landing page table and available via the public API.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search API models..." 
              value={landingSearchQuery}
              onChange={e => setLandingSearchQuery(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', color: 'var(--color-text)', width: '220px', outline: 'none' }}
            />
          </div>
          <button
            onClick={handleRemoveAllLandingPage}
            style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s, border-color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
          >
            <Trash2 size={13} /> Delete All
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '15%' }}>Hidden Provider</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '30%' }}>Model</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '10%' }}>Context</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '15%' }}>Pricing (In / Out)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '15%' }}>Capabilities</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '15%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const landingPageModels = providers
                  .flatMap(p => p.models.map(m => ({ ...m, providerName: p.name, providerId: p.id, providerIcon: p.icon, providerStatus: p.status })))
                  .filter(m => m.showOnLandingPage)
                  .filter(m => {
                    if (!landingSearchQuery.trim()) return true;
                    const q = landingSearchQuery.toLowerCase();
                    return m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || (m.originalId && m.originalId.toLowerCase().includes(q));
                  })
                  .sort((a, b) => (a.landingPagePriority || 0) - (b.landingPagePriority || 0));
                
                if (landingPageModels.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        No models selected for landing page. Select models from the list above and click "Add to Landing Page".
                      </td>
                    </tr>
                  );
                }

                return landingPageModels.map((m, index) => (
                  <tr key={`${m.providerId}-${m.id}`} style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.01)', opacity: m.providerStatus === false ? 0.5 : 1 }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--color-primary, #ef4444)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                            {m.providerName}
                          </span>
                          {m.providerStatus === false && (
                            <span style={{ fontSize: '9px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)' }}>Disabled</span>
                          )}
                        </div>
                        <code style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)', width: 'max-content' }} title="Original Model ID">
                          {m.originalId || m.id}
                        </code>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ position: 'relative', marginTop: '2px' }}>
                            <button 
                              onClick={() => setIconPickerOpenFor(iconPickerOpenFor === `${m.providerId}-${m.id}` ? null : `${m.providerId}-${m.id}`)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', outline: 'none' }}
                              title="Select Icon"
                            >
                              {m.icon ? <img src={m.icon} width={16} height={16} alt="" style={{ borderRadius: '2px' }} /> : <ImageIcon size={14} color="var(--color-text-muted)" />}
                            </button>

                            {iconPickerOpenFor === `${m.providerId}-${m.id}` && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', width: '280px', zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                                    <label title="Upload image from computer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '4px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                                      <Upload size={14} color="var(--color-text-muted)" />
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (evt) => {
                                              const base64 = evt.target?.result;
                                              if (typeof base64 === 'string') {
                                                handleUpdateModelIcon(m.providerId, m.id, base64);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    <input 
                                      type="text" 
                                      value={m.icon || ''}
                                      onChange={(e) => handleUpdateModelIcon(m.providerId, m.id, e.target.value)}
                                      placeholder="Paste Image URL..." 
                                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '11px' }} 
                                    />
                                    <button onClick={() => setIconPickerOpenFor(null)} title="Close" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <X size={14} color="var(--color-text-muted)" />
                                    </button>
                                 </div>
                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                   {PRESET_ICONS.map(icon => (
                                      <button 
                                        key={icon.name}
                                        onClick={() => {
                                          handleUpdateModelIcon(m.providerId, m.id, icon.url);
                                          setIconPickerOpenFor(null);
                                        }}
                                        title={icon.name}
                                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px', background: m.icon === icon.url ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg-soft)', border: `1px solid ${m.icon === icon.url ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                      >
                                        <img src={icon.url} width={20} height={20} alt={icon.name} />
                                      </button>
                                   ))}
                                 </div>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{m.name}</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <code style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-primary, #3b82f6)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                {m.id}
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{m.contextWindow || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>
                      ${m.inputPrice || '0'} / ${m.outputPrice || '0'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                        {m.text && <span title="Text"><Type size={14} /></span>}
                        {m.reasoning && <span title="Reasoning"><Brain size={14} /></span>}
                        {m.vision && <span title="Vision"><Eye size={14} /></span>}
                        {m.image && <span title="Image Gen"><ImageIcon size={14} /></span>}
                        {m.video && <span title="Video"><Video size={14} /></span>}
                        {m.audio && <span title="Audio"><Mic size={14} /></span>}
                        {m.embedding && <span title="Embedding"><Database size={14} /></span>}
                        {(!m.text && !m.reasoning && !m.vision && !m.image && !m.video && !m.audio && !m.embedding) && <span style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.5 }}>None</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button 
                          onClick={() => handleMoveLandingPageModel(index, 'up')}
                          disabled={index === 0}
                          style={{ background: 'none', border: 'none', color: index === 0 ? 'var(--color-text-muted)' : 'var(--color-text-main)', cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', opacity: index === 0 ? 0.3 : 1 }}
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button 
                          onClick={() => handleMoveLandingPageModel(index, 'down')}
                          disabled={index === landingPageModels.length - 1}
                          style={{ background: 'none', border: 'none', color: index === landingPageModels.length - 1 ? 'var(--color-text-muted)' : 'var(--color-text-main)', cursor: index === landingPageModels.length - 1 ? 'not-allowed' : 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', opacity: index === landingPageModels.length - 1 ? 0.3 : 1 }}
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button 
                          onClick={() => handleRemoveLandingPage(m.providerId, m.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger, #ef4444)', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}
                          title="Remove from Landing Page"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD CUSTOM MODEL DRAWER ===== */}
      {showAddCustomModel && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowAddCustomModel(false)}>
          <div style={{ width: '420px', background: 'var(--color-card-bg)', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-soft)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Add Custom Model</h2>
              <button onClick={() => setShowAddCustomModel(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Provider</label>
                <select value={customModelProviderId} onChange={e => setCustomModelProviderId(e.target.value)} style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px', appearance: 'auto' }}>
                  <option value="">Select Provider</option>
                  {providers.filter(p => p.status).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original Model ID</label>
                <input type="text" value={customModelOriginalId} onChange={e => setCustomModelOriginalId(e.target.value)} placeholder="e.g. gpt-4o" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model Name</label>
                <input type="text" value={customModelName} onChange={e => setCustomModelName(e.target.value)} placeholder="e.g. GPT-4o" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Showing Model ID</label>
                <input type="text" value={customModelShowingId} onChange={e => setCustomModelShowingId(e.target.value)} placeholder="e.g. cr-gpt-4o" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Users will use this ID to call the API.</span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>Capabilities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { label: 'Text', state: customModelText, setter: setCustomModelText },
                    { label: 'Reasoning', state: customModelReasoning, setter: setCustomModelReasoning },
                    { label: 'Vision', state: customModelVision, setter: setCustomModelVision },
                    { label: 'Image', state: customModelImage, setter: setCustomModelImage },
                    { label: 'Video', state: customModelVideo, setter: setCustomModelVideo },
                    { label: 'Embedding', state: customModelEmbedding, setter: setCustomModelEmbedding },
                    { label: 'Audio', state: customModelAudio, setter: setCustomModelAudio },
                  ].map(cap => (
                    <label key={cap.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer', background: 'var(--color-bg-soft)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      <input type="checkbox" checked={cap.state} onChange={e => cap.setter(e.target.checked)} />
                      {cap.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Context Window</label>
                  <input type="text" value={customModelContextWindow} onChange={e => setCustomModelContextWindow(e.target.value)} placeholder="e.g. 128K" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                </div>
              </div>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Input Price (per 1M)</label>
                  <input type="text" value={customModelInputPrice} onChange={e => setCustomModelInputPrice(e.target.value)} placeholder="e.g. $5/M" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Output Price (per 1M)</label>
                  <input type="text" value={customModelOutputPrice} onChange={e => setCustomModelOutputPrice(e.target.value)} placeholder="e.g. $15/M" style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px', justifyContent: 'flex-end', background: 'var(--color-card-bg)' }}>
              <button onClick={() => setShowAddCustomModel(false)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddCustomModel} className="btn-primary" style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>Add Model</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
