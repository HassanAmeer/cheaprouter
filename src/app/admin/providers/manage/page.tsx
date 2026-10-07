'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../../admin.module.css';
import { Save, Plus, X, ChevronLeft, RefreshCw, Play, Pause, Globe, Info, ExternalLink, Copy, Upload, History, Check, Download, Edit, Search, Trash2, Eye, EyeOff, Code, Layers, ChevronDown, ChevronUp, Sliders, Sparkles, Send, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { ALL_PROVIDERS_INFO } from './providersInfo';
import Editor from '@monaco-editor/react';
import Link from 'next/link';
import OpenRouterSetup, { OpenRouterSetupRef } from '../OpenRouterSetup';
import OpenCodeSetup, { OpenCodeSetupRef } from '../OpenCodeSetup';
import OpenAISetup, { OpenAISetupRef } from '../OpenAISetup';
import AnthropicSetup, { AnthropicSetupRef } from '../AnthropicSetup';
import CohereSetup, { CohereSetupRef } from '../CohereSetup';
import GroqSetup, { GroqSetupRef } from '../GroqSetup';
import GoogleSetup, { GoogleSetupRef } from '../GoogleSetup';
import CerebrasSetup, { CerebrasSetupRef } from '../CerebrasSetup';
import SambaNovaSetup, { SambaNovaSetupRef } from '../SambaNovaSetup';
import XAISetup, { XAISetupRef } from '../XAISetup';
import NovitaSetup, { NovitaSetupRef } from '../NovitaSetup';
import BytezSetup, { BytezSetupRef } from '../BytezSetup';
import AIMLAPISetup, { AIMLAPISetupRef } from '../AIMLAPISetup';
import TokenHarborSetup, { TokenHarborSetupRef } from '../TokenHarborSetup';
import AIANDSetup, { AIANDSetupRef } from '../AIANDSetup';
import MistralSetup, { MistralSetupRef } from '../MistralSetup';
import TogetherSetup, { TogetherSetupRef } from '../TogetherSetup';
import DeepSeekSetup, { DeepSeekSetupRef } from '../DeepSeekSetup';
import FireworksSetup, { FireworksSetupRef } from '../FireworksSetup';
import PerplexitySetup, { PerplexitySetupRef } from '../PerplexitySetup';
import AmazonBedrockSetup, { AmazonBedrockSetupRef } from '../AmazonBedrockSetup';
import GithubSetup, { GithubSetupRef } from '../GithubSetup';
import HuggingFaceSetup, { HuggingFaceSetupRef } from '../HuggingFaceSetup';
import HyperbolicSetup, { HyperbolicSetupRef } from '../HyperbolicSetup';
import MoonshotSetup, { MoonshotSetupRef } from '../MoonshotSetup';
import ZaiSetup, { ZaiSetupRef } from '../ZaiSetup';
import NvidiaSetup, { NvidiaSetupRef } from '../NvidiaSetup';
import KiloCodeSetup, { KiloCodeSetupRef } from '../KiloCodeSetup';
import ClineCodeSetup, { ClineCodeSetupRef } from '../ClineCodeSetup';
import PoixeSetup, { PoixeSetupRef } from '../PoixeSetup';
import SiliconFlowSetup, { SiliconFlowSetupRef } from '../SiliconFlowSetup';
import ZenmuxSetup, { ZenmuxSetupRef } from '../ZenmuxSetup';
import UnoRouterSetup, { UnoRouterSetupRef } from '../UnoRouterSetup';
import RoutewaySetup, { RoutewaySetupRef } from '../RoutewaySetup';
import StepFunSetup, { StepFunSetupRef } from '../StepFunSetup';
import LLM7Setup, { LLM7SetupRef } from '../LLM7Setup';
import ModelScopeSetup, { ModelScopeSetupRef } from '../ModelScopeSetup';
import AIHordeSetup, { AIHordeSetupRef } from '../AIHordeSetup';
import PollinationsSetup, { PollinationsSetupRef } from '../PollinationsSetup';
import AnyRouterSetup, { AnyRouterSetupRef } from '../AnyRouterSetup';
import AgnesAISetup, { AgnesAISetupRef } from '../AgnesAISetup';
import TokenRouterSetup, { TokenRouterSetupRef } from '../TokenRouterSetup';


type Model = { id: string; name: string; originalId?: string; description?: string; themeColor?: string; isWhiteTheme?: boolean; shimmerEffect?: boolean; badgeText?: string; text?: boolean; reasoning?: boolean; vision?: boolean; image?: boolean; video?: boolean; embedding?: boolean; audio?: boolean; contextWindow?: string; tokenLimit?: string; access?: string; inputPrice?: string; outputPrice?: string; offInputPrice?: string; offOutputPrice?: string; showOnLandingPage?: boolean; };
type Header = { id: string; key: string; value: string };
type Provider = { id: string; name: string; status: boolean; byokEnabled?: boolean; key: string; priority: number; models: Model[]; baseUrl?: string; useModelsApi?: boolean; modelsApiLink?: string; headers?: Header[]; isCustom?: boolean; apiFormat?: string; icon?: string };

const editorOptions: any = {
  minimap: { enabled: false },
  fontSize: 12,
  wordWrap: 'on',
  formatOnPaste: true,
  padding: { top: 12, bottom: 12 }
};

export default function ManageProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [isLoadingBackup, setIsLoadingBackup] = useState(false);

  const [displayVersion, setDisplayVersion] = useState<1 | 2>(1);
  const [backupData, setBackupData] = useState<any[] | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [providersData, setProvidersData] = useState(ALL_PROVIDERS_INFO);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom provider testing and keys visibility
  const [testingCustomKey, setTestingCustomKey] = useState<Record<string, boolean>>({});
  const [testCustomSuccess, setTestCustomSuccess] = useState<Record<string, boolean | null>>({});
  const [showCustomKeys, setShowCustomKeys] = useState<Record<string, boolean>>({});

  // Right-side models drawer for Custom Providers
  const [drawerProviderId, setDrawerProviderId] = useState<string | null>(null);
  const [drawerAvailableModels, setDrawerAvailableModels] = useState<any[]>([]);
  const [fetchingDrawerModels, setFetchingDrawerModels] = useState(false);
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [drawerManualName, setDrawerManualName] = useState('');
  const [drawerManualId, setDrawerManualId] = useState('');
  const [showDrawerManualAdd, setShowDrawerManualAdd] = useState(false);
  const [drawerTestModelId, setDrawerTestModelId] = useState('');
  const [drawerTestingCap, setDrawerTestingCap] = useState<string | null>(null);
  const [drawerTestResult, setDrawerTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Custom Provider Drawer Tab and Playground states
  const [customDrawerTab, setCustomDrawerTab] = useState<'manage' | 'test'>('manage');
  const [customDrawerKeysCollapsed, setCustomDrawerKeysCollapsed] = useState(false);
  const [customDrawerAvailableCollapsed, setCustomDrawerAvailableCollapsed] = useState(false);
  const [customDrawerSelectedCollapsed, setCustomDrawerSelectedCollapsed] = useState(false);
  const [customTestType, setCustomTestType] = useState<'text' | 'vision' | 'image'>('text');
  const [customTestPrompt, setCustomTestPrompt] = useState('Hello! Please explain what you can do in 2 short sentences.');
  const [customTestImageUrl, setCustomTestImageUrl] = useState('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500');
  const [customIsSendingTest, setCustomIsSendingTest] = useState(false);
  const [customTestResponse, setCustomTestResponse] = useState<{
    ok: boolean;
    message: string;
    text?: string;
    imageUrl?: string;
    latencyMs?: number;
    status?: number;
  } | null>(null);
  const [customCopiedResponse, setCustomCopiedResponse] = useState(false);

  const monacoEditorRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleVersion = async (v: 1 | 2) => {
    setDisplayVersion(v);
    if (v === 2 && !backupData) {
      try {
const res = await fetch('/api/admin/providers/get-backup', { headers: getAuthHeaders() });
        const result = await res.json();
        if (res.ok) setBackupData(result.data);
        else setBackupData([]);
      } catch {
        setBackupData([]);
      }
    }
  };

  const openRouterRef = useRef<OpenRouterSetupRef>(null);
  const openCodeRef = useRef<OpenCodeSetupRef>(null);
  const openaiRef = useRef<OpenAISetupRef>(null);
  const anthropicRef = useRef<AnthropicSetupRef>(null);
  const cohereRef = useRef<CohereSetupRef>(null);
  const groqRef = useRef<GroqSetupRef>(null);
  const googleRef = useRef<GoogleSetupRef>(null);
  const cerebrasRef = useRef<CerebrasSetupRef>(null);
  const sambanovaRef = useRef<SambaNovaSetupRef>(null);
  const xaiRef = useRef<XAISetupRef>(null);
  const novitaRef = useRef<NovitaSetupRef>(null);
  const bytezRef = useRef<BytezSetupRef>(null);
  const aimlapiRef = useRef<AIMLAPISetupRef>(null);
  const tokenharborRef = useRef<TokenHarborSetupRef>(null);
  const aiandRef = useRef<AIANDSetupRef>(null);
  const mistralRef = useRef<MistralSetupRef>(null);
  const togetherRef = useRef<TogetherSetupRef>(null);
  const deepseekRef = useRef<DeepSeekSetupRef>(null);
  const fireworksRef = useRef<FireworksSetupRef>(null);
  const perplexityRef = useRef<PerplexitySetupRef>(null);
  const amazonbedrockRef = useRef<AmazonBedrockSetupRef>(null);
  const githubRef = useRef<GithubSetupRef>(null);
  const huggingfaceRef = useRef<HuggingFaceSetupRef>(null);
  const hyperbolicRef = useRef<HyperbolicSetupRef>(null);
  const moonshotRef = useRef<MoonshotSetupRef>(null);
  const zaiRef = useRef<ZaiSetupRef>(null);
  const nvidiaRef = useRef<NvidiaSetupRef>(null);
  const kilocodeRef = useRef<KiloCodeSetupRef>(null);
  const clinecodeRef = useRef<ClineCodeSetupRef>(null);
  const poixeRef = useRef<PoixeSetupRef>(null);
  const siliconflowRef = useRef<SiliconFlowSetupRef>(null);
  const zenmuxRef = useRef<ZenmuxSetupRef>(null);
  const unorouterRef = useRef<UnoRouterSetupRef>(null);
  const routewayRef = useRef<RoutewaySetupRef>(null);
  const stepfunRef = useRef<StepFunSetupRef>(null);
  const llm7Ref = useRef<LLM7SetupRef>(null);
  const modelscopeRef = useRef<ModelScopeSetupRef>(null);
  const aihordeRef = useRef<AIHordeSetupRef>(null);
  const pollinationsRef = useRef<PollinationsSetupRef>(null);
  const anyrouterRef = useRef<AnyRouterSetupRef>(null);
  const agnesaiRef = useRef<AgnesAISetupRef>(null);
  const tokenrouterRef = useRef<TokenRouterSetupRef>(null);

  const [testingAll, setTestingAll] = useState(false);

  // Add Provider form state
  const [showAddProvider, setShowAddProvider] = useState(true);
  const [newProvId, setNewProvId] = useState('');
  const [newProvName, setNewProvName] = useState('');
  const [newProvIcon, setNewProvIcon] = useState('');
  const [newProvBaseUrl, setNewProvBaseUrl] = useState('');
  const [newProvApiFormat, setNewProvApiFormat] = useState('');
  const [newProvUseModelsApi, setNewProvUseModelsApi] = useState(false);
  const [newProvModelsApiLink, setNewProvModelsApiLink] = useState('');
  const [newProvModels, setNewProvModels] = useState<Model[]>([]);
  const [newProvKey, setNewProvKey] = useState('');
  const [newProvHeaders, setNewProvHeaders] = useState<Header[]>([]);

  // Add Model form state
  const [addingModelTo, setAddingModelTo] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [newModelOriginalId, setNewModelOriginalId] = useState('');
  const [newModelShowingId, setNewModelShowingId] = useState('');
  const [newModelReasoning, setNewModelReasoning] = useState(false);
  const [newModelImage, setNewModelImage] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || '') : '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchProviders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let list: Provider[] = [];
      const headers: Record<string, string> = getAuthHeaders();
      const res = await fetch('/api/admin/providers', { headers });
      if (res.ok) {
        const data = await res.json();
        const rawArray = Array.isArray(data) ? data : (data && Array.isArray(data.providers) ? data.providers : []);
        list = rawArray.map((p: any) => ({
          id: p.id, name: p.name, icon: p.icon || '', status: p.status ?? true,
          byokEnabled: p.byok_enabled ?? p.byokEnabled ?? true,
          key: p.key || '', priority: p.priority ?? 0,
          baseUrl: p.base_url ?? p.baseUrl,
          useModelsApi: p.use_models_api ?? p.useModelsApi ?? false,
          modelsApiLink: p.models_api_link ?? p.modelsApiLink ?? '',
          apiFormat: p.api_format ?? p.apiFormat,
          isCustom: p.is_custom ?? p.isCustom ?? false,
          headers: p.headers || [],
          models: Array.isArray(p.models)
            ? p.models.map((m: any) => typeof m === 'string'
              ? { id: m, name: m, originalId: m, reasoning: false, image: false, tokenLimit: 'Unlimited', access: 'Free' }
              : { ...m, id: m.id || m.originalId || '', name: m.name || m.originalName || m.id || '', originalId: m.originalId || m.id || '', reasoning: m.reasoning ?? m.text ?? false, image: m.image || m.vision || false, tokenLimit: m.tokenLimit || 'Unlimited', access: m.access || 'Free' })
            : []
        }));
      }

      const openRouterRes = await fetch('/api/admin/openrouter', { headers });
      if (openRouterRes.ok) {
        const openRouterData = await openRouterRes.json();
        if (openRouterData && Array.isArray(openRouterData.models)) {
          const openRouterModels = openRouterData.models.map((m: any) => typeof m === 'string'
            ? { id: m, name: m, originalId: m, reasoning: true, image: false, tokenLimit: 'Unlimited', access: 'Free' }
            : { ...m, id: m.id || m.originalId || '', name: m.name || m.originalName || m.id || '', originalId: m.originalId || m.id || '', reasoning: m.text ?? m.reasoning ?? true, image: m.image || m.vision || false, tokenLimit: m.tokenLimit || 'Unlimited', access: m.access || 'Free' });
          const idx = list.findIndex(p => p.id === 'ap_openrouter' || p.id === 'openrouter');
          if (idx >= 0) { list[idx].models = openRouterModels; if (openRouterData.key) list[idx].key = openRouterData.key; if (openRouterData.status !== undefined) list[idx].status = openRouterData.status; }
          else list.push({ id: 'ap_openrouter', name: 'OpenRouter', status: openRouterData.status ?? true, key: openRouterData.key || '', priority: 10, models: openRouterModels, isCustom: true });
        }
      }
      setProviders(list);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleTestAllPrefixProviders = async () => {
    setTestingAll(true);
    const openRouterPassed = openRouterRef.current ? await openRouterRef.current.testApi() : true;
    const openCodePassed = openCodeRef.current ? await openCodeRef.current.testApi() : true;
    const openaiPassed = openaiRef.current ? await openaiRef.current.testApi(true) : true;
    const anthropicPassed = anthropicRef.current ? await anthropicRef.current.testApi(true) : true;
    const coherePassed = cohereRef.current ? await cohereRef.current.testApi(true) : true;
    const groqPassed = groqRef.current ? await groqRef.current.testApi(true) : true;
    const googlePassed = googleRef.current ? await googleRef.current.testApi(true) : true;
    const cerebrasPassed = cerebrasRef.current ? await cerebrasRef.current.testApi(true) : true;
    const sambanovaPassed = sambanovaRef.current ? await sambanovaRef.current.testApi(true) : true;
    const xaiPassed = xaiRef.current ? await xaiRef.current.testApi(true) : true;
    const novitaPassed = novitaRef.current ? await novitaRef.current.testApi(true) : true;
    const bytezPassed = bytezRef.current ? await bytezRef.current.testApi(true) : true;
    const aimlapiPassed = aimlapiRef.current ? await aimlapiRef.current.testApi(true) : true;
    const mistralPassed = mistralRef.current ? await mistralRef.current.testApi(true) : true;
    const togetherPassed = togetherRef.current ? await togetherRef.current.testApi(true) : true;
    const aiandPassed = aiandRef.current ? await aiandRef.current.testApi(true) : true;
    const deepseekPassed = deepseekRef.current ? await deepseekRef.current.testApi(true) : true;
    const fireworksPassed = fireworksRef.current ? await fireworksRef.current.testApi(true) : true;
    const perplexityPassed = perplexityRef.current ? await perplexityRef.current.testApi(true) : true;

    const allPassed = openRouterPassed && openCodePassed && openaiPassed && anthropicPassed && coherePassed &&
      groqPassed && googlePassed && cerebrasPassed && sambanovaPassed && xaiPassed && novitaPassed && bytezPassed && aimlapiPassed &&
      mistralPassed && togetherPassed && aiandPassed && deepseekPassed && fireworksPassed && perplexityPassed;

    setTestingAll(false);
  };

  const toggleProvider = (id: string) => { setProviders(providers.map(p => p.id === id ? { ...p, status: !p.status } : p)); setSaved(false); };
  const toggleByokProvider = async (id: string, defaultName?: string) => {
    let prov = providers.find(p => p.id === id || (id === 'ap_openrouter' && p.id === 'openrouter') || (id === 'ap_opencode' && p.id === 'opencode'));
    let updated: Provider[];
    let targetState = true;
    if (prov) {
      targetState = !(prov.byokEnabled ?? true);
      updated = providers.map(p => (p.id === prov!.id) ? { ...p, byokEnabled: targetState } : p);
    } else {
      targetState = false;
      const newProv: Provider = {
        id,
        name: defaultName || id.replace(/^ap_/, '').toUpperCase(),
        status: false,
        key: '',
        priority: providers.length + 1,
        models: [],
        byokEnabled: targetState,
        isCustom: true
      };
      updated = [...providers, newProv];
      prov = newProv;
    }
    setProviders(updated);
    setSaved(false);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      await fetch('/api/admin/providers', { method: 'PUT', headers, body: JSON.stringify(updated) });
      showToast(`BYOK ${targetState ? 'Enabled' : 'Disabled'} for ${prov?.name || id}`);
    } catch (err) {
      console.error('Failed to auto-save BYOK status', err);
      showToast(`Failed to update BYOK for ${prov?.name || id}`);
    }
  };

  const getByokStatus = (id: string, altId?: string) => {
    const prov = providers.find(p => p.id === id || (altId && p.id === altId));
    return prov?.byokEnabled ?? true;
  };
  const toggleExpanded = (id: string) => { const next = new Set(expandedProviders); if (next.has(id)) next.delete(id); else next.add(id); setExpandedProviders(next); };

  const parseKeys = (keyStr: string): { key: string, active: boolean }[] => {
    try {
      const parsed = JSON.parse(keyStr || '[""]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(k => typeof k === 'string' ? { key: k, active: true } : { key: k.key || '', active: k.active ?? true });
      }
      return [{ key: keyStr || '', active: true }];
    } catch {
      return [{ key: keyStr || '', active: true }];
    }
  };

  const updateKeyIndex = (id: string, index: number, val: string) => {
    setProviders(providers.map(p => {
      if (p.id !== id) return p;
      const keys = parseKeys(p.key);
      keys[index].key = val;
      return { ...p, key: JSON.stringify(keys) };
    }));
    setSaved(false);
  };

  const toggleKeyActive = (id: string, index: number) => {
    setProviders(providers.map(p => {
      if (p.id !== id) return p;
      const keys = parseKeys(p.key);
      keys[index].active = !keys[index].active;
      return { ...p, key: JSON.stringify(keys) };
    }));
    setSaved(false);
  };

  const addKey = (id: string) => {
    setProviders(providers.map(p => {
      if (p.id !== id) return p;
      const keys = parseKeys(p.key);
      keys.push({ key: '', active: true });
      return { ...p, key: JSON.stringify(keys) };
    }));
    setSaved(false);
  };

  const removeKey = (id: string, index: number) => {
    setProviders(providers.map(p => {
      if (p.id !== id) return p;
      const keys = parseKeys(p.key);
      keys.splice(index, 1);
      return { ...p, key: JSON.stringify(keys) };
    }));
    setSaved(false);
  };

  const updateBaseUrl = (id: string, val: string) => { setProviders(providers.map(p => p.id === id ? { ...p, baseUrl: val } : p)); setSaved(false); };
  const updateApiFormat = (id: string, val: string) => { setProviders(providers.map(p => p.id === id ? { ...p, apiFormat: val } : p)); setSaved(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch('/api/admin/providers', { method: 'PUT', headers, body: JSON.stringify(providers) });
      const openRouterProv = providers.find(p => p.id === 'ap_openrouter' || p.id === 'openrouter');
      if (openRouterProv) {
        await fetch('/api/admin/openrouter', { method: 'PUT', headers, body: JSON.stringify({ key: openRouterProv.key, status: openRouterProv.status, models: openRouterProv.models }) });
      }
      const openCodeProv = providers.find(p => p.id === 'ap_opencode' || p.id === 'opencode');
      if (openCodeProv) {
        await fetch('/api/admin/opencode', { method: 'PUT', headers, body: JSON.stringify({ key: openCodeProv.key, status: openCodeProv.status, models: openCodeProv.models }) });
      }
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleAddProvider = async () => {
    if (!newProvName.trim()) {
      showToast('Please enter a provider name');
      return;
    }
    let initialModels: Model[] = [];
    if (!newProvUseModelsApi) {
      initialModels = newProvModels.filter(m => m.name.trim() && m.id.trim()).map(m => ({
        ...m,
        id: m.id.trim(),
        name: m.name.trim(),
        originalId: m.originalId?.trim() || m.id.trim(),
        text: m.text ?? true,
        reasoning: m.reasoning ?? false,
        image: m.image ?? false,
        tokenLimit: m.tokenLimit || 'Unlimited',
        access: m.access || 'Free'
      }));
    }
    const providerId = newProvId.trim()
      ? newProvId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
      : `prov_${Date.now()}`;

    const formattedKey = newProvKey.trim()
      ? JSON.stringify([{ key: newProvKey.trim(), active: true }])
      : '[]';

    const newProv: Provider = {
      id: providerId,
      name: newProvName.trim(),
      icon: newProvIcon.trim() || undefined,
      status: true,
      byokEnabled: true,
      key: formattedKey,
      priority: providers.length + 1,
      models: initialModels,
      baseUrl: newProvBaseUrl.trim() || undefined,
      apiFormat: newProvApiFormat,
      useModelsApi: newProvUseModelsApi,
      modelsApiLink: newProvModelsApiLink.trim() || undefined,
      headers: newProvHeaders,
      isCustom: true
    };

    const updated = [...providers, newProv];
    setProviders(updated);
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

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      await fetch('/api/admin/providers', { method: 'PUT', headers, body: JSON.stringify(updated) });
      showToast(`Custom provider "${newProv.name}" created and saved!`);
      setExpandedProviders(prev => new Set([...prev, providerId]));
    } catch (e) {
      console.error('Failed to auto-save new custom provider', e);
      showToast(`Provider "${newProv.name}" created!`);
    }
  };

  const updateProviderName = (id: string, val: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, name: val } : p));
    setSaved(false);
  };

  const handleSaveCustomProvider = async (targetId: string) => {
    const prov = providers.find(p => p.id === targetId);
    if (!prov) return;
    setSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch('/api/admin/providers', { method: 'PUT', headers, body: JSON.stringify(providers) });
      if (res.ok) {
        showToast(`✓ ${prov.name} saved successfully!`);
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Failed to save provider', err);
      showToast(`Failed to save ${prov.name}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestCustomKey = async (provider: Provider, keyIndex: number) => {
    const keys = parseKeys(provider.key);
    const targetKey = keys[keyIndex]?.key;
    const testId = `${provider.id}_${keyIndex}`;

    if (!targetKey || !targetKey.trim()) {
      showToast('Please enter an API Key to test');
      setTestCustomSuccess(prev => ({ ...prev, [testId]: false }));
      return;
    }

    setTestingCustomKey(prev => ({ ...prev, [testId]: true }));
    setTestCustomSuccess(prev => ({ ...prev, [testId]: null }));

    try {
      const res = await fetch('/api/admin/providers/custom-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          baseUrl: provider.baseUrl,
          modelsApiLink: provider.modelsApiLink,
          key: targetKey,
          headers: provider.headers,
          apiFormat: provider.apiFormat
        })
      });
      const data = await res.json();
      if (res.ok && (data.ok || Array.isArray(data.data))) {
        setTestCustomSuccess(prev => ({ ...prev, [testId]: true }));
        showToast(`✓ ${provider.name} connected successfully! (${data.count || data.data?.length || 0} models available)`);
      } else {
        setTestCustomSuccess(prev => ({ ...prev, [testId]: false }));
        showToast(`✗ Test failed: ${data.error || 'Connection error'}`);
      }
    } catch (e: any) {
      setTestCustomSuccess(prev => ({ ...prev, [testId]: false }));
      showToast(`✗ Test failed: ${e.message || 'Network error'}`);
    } finally {
      setTestingCustomKey(prev => ({ ...prev, [testId]: false }));
    }
  };

  const handleOpenDrawer = (providerId: string) => {
    setDrawerProviderId(providerId);
    setDrawerSearchQuery('');
    setDrawerError(null);
    setDrawerAvailableModels([]);
    setShowDrawerManualAdd(false);
    setDrawerTestResult(null);
    setCustomDrawerTab('manage');
    setCustomDrawerKeysCollapsed(false);
    setCustomDrawerAvailableCollapsed(false);
    setCustomDrawerSelectedCollapsed(false);
    setCustomTestResponse(null);
    setCustomTestPrompt('Hello! Please explain what you can do in 2 short sentences.');
    setCustomTestType('text');
    const prov = providers.find(p => p.id === providerId);
    if (prov) {
      setDrawerTestModelId(prov.models[0]?.originalId || prov.models[0]?.id || '');
      if (prov.baseUrl || prov.modelsApiLink) {
        handleFetchCustomModels(prov);
      }
    }
  };

  const handleRunCustomCapabilityTest = async (prov: Provider, capType: 'text' | 'vision' | 'image') => {
    const keys = parseKeys(prov.key);
    const validKey = keys.find(k => k.active && k.key.trim())?.key || keys[0]?.key || '';
    if (!validKey) {
      setCustomTestResponse({ ok: false, message: 'Please add and activate an API key first' });
      return;
    }
    if (!drawerTestModelId) {
      setCustomTestResponse({ ok: false, message: 'Please select a model to test' });
      return;
    }

    setCustomIsSendingTest(true);
    setCustomTestResponse(null);

    try {
      const res = await fetch('/api/admin/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          providerId: prov.id,
          model: drawerTestModelId,
          originalId: drawerTestModelId,
          key: validKey,
          baseUrl: prov.baseUrl,
          headers: prov.headers,
          testType: capType,
          prompt: customTestPrompt,
          imageUrl: capType === 'vision' ? customTestImageUrl : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setCustomTestResponse({
          ok: true,
          message: data.message || `${capType.toUpperCase()} test completed successfully!`,
          text: data.preview,
          imageUrl: data.generatedImageUrl,
          latencyMs: data.latencyMs,
          status: 200
        });
      } else {
        setCustomTestResponse({
          ok: false,
          message: data.message || `Test failed with status ${res.status}`,
          status: data.status || res.status,
          latencyMs: data.latencyMs
        });
      }
    } catch (e: any) {
      setCustomTestResponse({ ok: false, message: e.message || 'Network error during test execution' });
    } finally {
      setCustomIsSendingTest(false);
    }
  };

  const handleSelectCustomTestType = (type: 'text' | 'vision' | 'image') => {
    setCustomTestType(type);
    setCustomTestResponse(null);
    if (type === 'text') {
      setCustomTestPrompt('Hello! Please explain what you can do in 2 short sentences.');
    } else if (type === 'vision') {
      setCustomTestPrompt('Describe what you see in this image in detail and list any key features.');
    } else if (type === 'image') {
      setCustomTestPrompt('A serene cybernetic garden with glowing neon blossoms at twilight, 8k resolution');
    }
  };

  const handleFetchCustomModels = async (prov: Provider) => {
    setFetchingDrawerModels(true);
    setDrawerError(null);
    try {
      const keys = parseKeys(prov.key);
      const validKey = keys.find(k => k.active && k.key.trim())?.key || keys[0]?.key || '';
      const res = await fetch('/api/admin/providers/custom-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          baseUrl: prov.baseUrl,
          modelsApiLink: prov.modelsApiLink,
          key: validKey,
          headers: prov.headers,
          apiFormat: prov.apiFormat
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setDrawerAvailableModels(data.data);
        if (!drawerTestModelId && data.data.length > 0) {
          setDrawerTestModelId(data.data[0].id);
        }
      } else {
        setDrawerError(data.error || 'Failed to fetch models from custom provider');
      }
    } catch (e: any) {
      setDrawerError(e.message || 'Error connecting to provider API');
    } finally {
      setFetchingDrawerModels(false);
    }
  };

  const toggleCustomDrawerModel = (model: any) => {
    if (!drawerProviderId) return;
    const prov = providers.find(p => p.id === drawerProviderId);
    if (!prov) return;

    const exists = prov.models.find(m => (m.originalId || m.id) === model.id);
    let nextModels: Model[];
    if (exists) {
      nextModels = prov.models.filter(m => (m.originalId || m.id) !== model.id);
    } else {
      const cleanId = model.id.split('/').pop()?.replace(/[^a-zA-Z0-9_-]/g, '_') || model.id;
      const mod = model.architecture?.modality || '';
      const isImg = mod.includes('image') || mod.includes('vision');
      const isAud = mod.includes('audio');
      const isVid = mod.includes('video');
      const newModel: Model = {
        id: cleanId,
        name: model.name || model.id,
        originalId: model.id,
        text: true,
        image: isImg,
        vision: isImg,
        audio: isAud,
        reasoning: false,
        video: isVid,
        tokenLimit: 'Unlimited',
        access: 'Free'
      };
      nextModels = [...prov.models, newModel];
    }
    const updated = providers.map(p => p.id === drawerProviderId ? { ...p, models: nextModels } : p);
    setProviders(updated);
  };

  const updateCustomDrawerModelField = (modelOriginalId: string, field: string, val: any) => {
    if (!drawerProviderId) return;
    const updated = providers.map(p => {
      if (p.id !== drawerProviderId) return p;
      return {
        ...p,
        models: p.models.map(m => (m.originalId || m.id) === modelOriginalId ? { ...m, [field]: val } : m)
      };
    });
    setProviders(updated);
  };

  const handleAddManualDrawerModel = () => {
    if (!drawerProviderId || !drawerManualName.trim() || !drawerManualId.trim()) return;
    const prov = providers.find(p => p.id === drawerProviderId);
    if (!prov) return;

    const newM: Model = {
      id: drawerManualId.trim().replace(/[^a-zA-Z0-9_-]/g, '_'),
      name: drawerManualName.trim(),
      originalId: drawerManualId.trim(),
      text: true,
      reasoning: false,
      image: false,
      vision: false,
      audio: false,
      video: false,
      tokenLimit: 'Unlimited',
      access: 'Free'
    };
    const updated = providers.map(p => p.id === drawerProviderId ? { ...p, models: [...p.models, newM] } : p);
    setProviders(updated);
    setDrawerManualName('');
    setDrawerManualId('');
    setShowDrawerManualAdd(false);
  };

  const handleCloseDrawer = async () => {
    if (drawerProviderId) {
      const prov = providers.find(p => p.id === drawerProviderId);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
        await fetch('/api/admin/providers', { method: 'PUT', headers, body: JSON.stringify(providers) });
        if (prov) showToast(`✓ Saved models for ${prov.name}`);
      } catch (e) {
        console.error('Failed to auto-save models on close', e);
      }
    }
    setDrawerProviderId(null);
  };

  const handleAddModel = (provId: string) => {
    if (!newModelName.trim() || !newModelOriginalId.trim() || !newModelShowingId.trim()) return;
    setProviders(providers.map(p => p.id === provId ? { ...p, models: [...p.models, { id: newModelShowingId, name: newModelName, originalId: newModelOriginalId, reasoning: newModelReasoning, image: newModelImage }] } : p));
    setNewModelName(''); setNewModelOriginalId(''); setNewModelShowingId(''); setNewModelReasoning(false); setNewModelImage(false); setAddingModelTo(null); setSaved(false);
  };

  const handleRemoveModel = (provId: string, modelId: string) => { setProviders(providers.map(p => p.id === provId ? { ...p, models: p.models.filter(m => m.id !== modelId) } : p)); setSaved(false); };
  const handleAddHeader = (provId: string) => { setProviders(providers.map(p => p.id === provId ? { ...p, headers: [...(p.headers || []), { id: `h_${Date.now()}`, key: '', value: '' }] } : p)); setSaved(false); };
  const handleUpdateHeader = (provId: string, headerId: string, field: 'key' | 'value', val: string) => { setProviders(providers.map(p => p.id === provId ? { ...p, headers: (p.headers || []).map(h => h.id === headerId ? { ...h, [field]: val } : h) } : p)); setSaved(false); };
  const handleRemoveHeader = (provId: string, headerId: string) => { setProviders(providers.map(p => p.id === provId ? { ...p, headers: (p.headers || []).filter(h => h.id !== headerId) } : p)); setSaved(false); };

  const getDomainFromUrl = (url?: string) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      return u.hostname;
    } catch { return null; }
  };

  const renderProviderTile = (provider: Provider, isCustomGroup: boolean) => {
    const isExpanded = expandedProviders.has(provider.id);
    const byokOn = provider.byokEnabled ?? true;

    return (
      <div key={provider.id} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s ease' }}>
        {/* CARD HEADER */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', background: isExpanded ? 'var(--color-bg-soft)' : 'transparent', flexWrap: 'wrap', gap: '12px' }}
          onClick={() => toggleExpanded(provider.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0 }}>
              {provider.icon ? (
                <img src={provider.icon} alt={provider.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              ) : getDomainFromUrl(provider.baseUrl) ? (
                <img src={`https://www.google.com/s2/favicons?domain=${getDomainFromUrl(provider.baseUrl)}&sz=128`} alt={provider.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              ) : (
                <Globe size={18} color="var(--color-primary)" />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-main)' }}>{provider.name}</span>
                {isCustomGroup && <span style={{ fontSize: '10px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Custom</span>}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{provider.models?.length || 0} models</span>
                {provider.baseUrl && (
                  <>
                    <span>•</span>
                    <span style={{ fontFamily: 'monospace', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.baseUrl}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
            {/* BYOK Toggle Switch */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: byokOn ? '#10b98115' : 'var(--color-bg-soft)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: `1px solid ${byokOn ? '#10b98144' : 'var(--color-border)'}`,
                cursor: 'pointer'
              }}
              onClick={() => toggleByokProvider(provider.id, provider.name)}
              title="Enable or disable showing this provider in user BYOK dashboard"
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: byokOn ? '#10b981' : 'var(--color-text-muted)' }}>
                BYOK {byokOn ? 'ON' : 'OFF'}
              </span>
              <div style={{
                width: '26px',
                height: '15px',
                background: byokOn ? '#10b981' : 'var(--color-text-muted)',
                borderRadius: '16px',
                position: 'relative',
                transition: 'background 0.3s'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '1.5px',
                  left: byokOn ? '12.5px' : '1.5px',
                  width: '12px',
                  height: '12px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>

            {/* Provider Status Toggle Switch */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: provider.status ? '#10b98115' : 'var(--color-bg-soft)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: `1px solid ${provider.status ? '#10b98144' : 'var(--color-border)'}`,
                cursor: 'pointer'
              }}
              onClick={() => toggleProvider(provider.id)}
              title="Toggle active status"
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: provider.status ? '#10b981' : 'var(--color-text-muted)' }}>
                {provider.status ? 'Active' : 'Disabled'}
              </span>
              <div style={{
                width: '26px',
                height: '15px',
                background: provider.status ? '#10b981' : 'var(--color-text-muted)',
                borderRadius: '16px',
                position: 'relative',
                transition: 'background 0.3s'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '1.5px',
                  left: provider.status ? '12.5px' : '1.5px',
                  width: '12px',
                  height: '12px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>

            {isCustomGroup && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete ${provider.name}?`)) {
                    const updated = providers.filter(p => p.id !== provider.id);
                    setProviders(updated);
                    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
                    fetch('/api/admin/providers', { method: 'PUT', headers, body: JSON.stringify(updated) });
                    showToast(`Deleted ${provider.name}`);
                  }
                }}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px', borderRadius: '8px', display: 'flex', cursor: 'pointer', transition: 'all 0.2s' }}
                title="Delete Custom Provider"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* EXPANDED BODY */}
        {isExpanded && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* BYOK Status Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-bg-soft)' }}>
              <div>
                <div style={{ color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 600 }}>Show in User BYOK Dashboard</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px' }}>Allow users to bring and connect their own {provider.name} API key.</div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={byokOn}
                  onChange={() => toggleByokProvider(provider.id, provider.name)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            {/* Provider Configuration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider Name</label>
                <input
                  type="text"
                  value={provider.name}
                  onChange={(e) => updateProviderName(provider.id, e.target.value)}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '9px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Base URL</label>
                <input
                  type="text"
                  value={provider.baseUrl || ''}
                  onChange={(e) => updateBaseUrl(provider.id, e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '9px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Format</label>
                <select
                  value={provider.apiFormat || 'OpenAI Compatible'}
                  onChange={(e) => updateApiFormat(provider.id, e.target.value)}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '9px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px', appearance: 'auto' }}
                >
                  <option value="OpenAI Compatible">OpenAI Compatible</option>
                  <option value="OpenAI Responses">OpenAI Responses</option>
                  <option value="Anthropic Messages">Anthropic Messages</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider Icon URL</label>
                <input
                  type="text"
                  value={provider.icon || ''}
                  onChange={(e) => { setProviders(providers.map(p => p.id === provider.id ? { ...p, icon: e.target.value } : p)); setSaved(false); }}
                  placeholder="https://cdn.simpleicons.org/..."
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '9px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* API Keys with Test Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 700 }}>API Keys &amp; Testing</label>
                <button type="button" onClick={() => addKey(provider.id)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={13} /> Add Key
                </button>
              </div>

              {parseKeys(provider.key).map((kObj, idx) => {
                const keyId = `${provider.id}_${idx}`;
                const isTesting = testingCustomKey[keyId];
                const testStatus = testCustomSuccess[keyId];
                const isKeyVisible = showCustomKeys[keyId];

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: kObj.active ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={isKeyVisible ? 'text' : 'password'}
                          value={kObj.key}
                          onChange={(e) => updateKeyIndex(provider.id, idx, e.target.value)}
                          placeholder={`Enter ${provider.name} API Key`}
                          disabled={!kObj.active}
                          autoComplete="new-password"
                          style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 40px 10px 14px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontFamily: 'monospace', fontSize: '13px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustomKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))}
                          style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', padding: '6px', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                          title={isKeyVisible ? 'Hide Key' : 'Show Key'}
                        >
                          {isKeyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleKeyActive(provider.id, idx)}
                        className="btn-secondary"
                        style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', height: '40px', color: kObj.active ? '#eab308' : '#10b981' }}
                        title={kObj.active ? 'Pause Key' : 'Resume Key'}
                      >
                        {kObj.active ? <Pause size={15} /> : <Play size={15} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTestCustomKey(provider, idx)}
                        disabled={isTesting || !kObj.active}
                        className="btn-secondary"
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          height: '40px',
                          color: testStatus === true ? '#10b981' : testStatus === false ? '#ef4444' : 'inherit',
                          borderColor: testStatus === true ? '#10b98144' : testStatus === false ? '#ef444444' : undefined,
                          background: testStatus === true ? '#10b98115' : testStatus === false ? '#ef444415' : undefined,
                          fontWeight: 600,
                          fontSize: '12px'
                        }}
                        title="Test API Key & Endpoint"
                      >
                        {isTesting ? (
                          <RefreshCw size={15} className={styles.spin} />
                        ) : testStatus === true ? (
                          <>
                            <Check size={15} /> Tested OK
                          </>
                        ) : testStatus === false ? (
                          <>
                            <X size={15} /> Test Failed
                          </>
                        ) : (
                          <>
                            <Play size={14} /> Test
                          </>
                        )}
                      </button>

                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => removeKey(provider.id, idx)}
                          className="btn-secondary"
                          style={{ padding: '10px 12px', display: 'flex', color: '#ef4444', height: '40px' }}
                          title="Remove Key"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Headers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 700 }}>Custom Headers (Optional)</label>
                <button type="button" onClick={() => handleAddHeader(provider.id)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={13} /> Add Header
                </button>
              </div>
              {provider.headers?.map(header => (
                <div key={header.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={header.key} onChange={(e) => handleUpdateHeader(provider.id, header.id, 'key', e.target.value)}
                    placeholder="Header Key (e.g. Authorization)"
                    style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }} />
                  <input type="text" value={header.value} onChange={(e) => handleUpdateHeader(provider.id, header.id, 'value', e.target.value)}
                    placeholder="Header Value"
                    style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }} />
                  <button type="button" onClick={() => handleRemoveHeader(provider.id, header.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Model Management & Select Models Button */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>Models Configuration</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {provider.models.length} active model{provider.models.length === 1 ? '' : 's'} configured
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer(provider.id)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
                  >
                    <Layers size={15} /> Select Models ({provider.models.length})
                  </button>
                </div>
              </div>

              {/* Direct Models API URL Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-main)', fontWeight: 600, flex: 1 }}>Use Direct Models List API Link</span>
                <label className={styles.toggleSwitch} style={{ transform: 'scale(0.85)' }}>
                  <input
                    type="checkbox"
                    checked={provider.useModelsApi || false}
                    onChange={() => { setProviders(providers.map(p => p.id === provider.id ? { ...p, useModelsApi: !(p.useModelsApi || false) } : p)); setSaved(false); }}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              {provider.useModelsApi && (
                <input
                  type="text"
                  value={provider.modelsApiLink || ''}
                  onChange={(e) => { setProviders(providers.map(p => p.id === provider.id ? { ...p, modelsApiLink: e.target.value } : p)); setSaved(false); }}
                  placeholder="e.g. https://api.openai.com/v1/models"
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '9px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}
                />
              )}

              {/* Active Model Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {provider.models.map(model => (
                  <div key={model.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)' }}>{model.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{model.originalId || model.id}</span>
                    </div>
                    {(model.reasoning || model.image || model.vision) && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {model.reasoning && <span style={{ fontSize: '9px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>Reasoning</span>}
                        {(model.image || model.vision) && <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>Vision</span>}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveModel(provider.id, model.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '2px', marginLeft: '4px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {provider.models.length === 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                    No models configured yet. Click "Select Models" to load models from the API.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => handleSaveCustomProvider(provider.id)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', fontSize: '13px', borderRadius: '8px' }}
              >
                <Save size={14} /> Save Provider Changes
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${provider.name}?`)) {
                    const updated = providers.filter(p => p.id !== provider.id);
                    setProviders(updated);
                    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
                    fetch('/api/admin/providers', { method: 'PUT', headers, body: JSON.stringify(updated) });
                    showToast(`Deleted ${provider.name}`);
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={14} /> Delete Provider
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  const handleCopyPrompt = () => {
    let promptText = "Please perform a deep, up-to-date research on the following AI providers to verify their FREE models, rate limits, and context windows.\\n\\n";
    promptText += "CRITICAL INSTRUCTIONS FOR YOU:\\n";
    promptText += "1. Make sure EVERY model has its exact technical 'id' (e.g. 'gemini-2.0-flash-exp'). Do not leave IDs blank or missing.\\n";
    promptText += "2. Keep the 'limit' text extremely short and concise using slashes or dashes (e.g., '15 RPM / 200 RPD'). Do NOT write long paragraphs or sentences.\\n";
    promptText += "3. Avoid vague terms like 'various free'. Specify the exact free models if they exist.\\n";
    promptText += "4. Some providers still have free models that are missing from this list. Please do deep research to find and add any missing currently free models for these providers.\\n";
    promptText += "5. You MUST actively read the official documentation and 'models' pages for each provider to verify this. Even if you have to process them in small batches, you must thoroughly complete the research.\\n";
    promptText += "6. You MUST return your final response as a single, valid JSON array of objects. Do not use Markdown formatting for the JSON, or if you do, ensure it is a single ```json block.\\n";
    promptText += "7. The JSON schema must exactly match: [{ \\\"name\\\": \\\"ProviderName\\\", \\\"tag\\\": \\\"TAG\\\", \\\"tagColor\\\": \\\"#HEX\\\", \\\"hasFree\\\": true/false, \\\"website\\\": \\\"url\\\", \\\"status\\\": \\\"string\\\", \\\"models\\\": [{ \\\"name\\\": \\\"Model Name\\\", \\\"id\\\": \\\"model-id\\\", \\\"badges\\\": [\\\"Text\\\"], \\\"limit\\\": \\\"limits text\\\" }] }]. Preserve all existing tagColors and tags.\\n";
    promptText += "8. DO NOT SKIP ANY PROVIDERS. You must output the complete list of all providers provided to you, maintaining the exact same order.\\n";
    promptText += "9. IF a provider is a free proxy or has a free tier (hasFree: true), you MUST list its actual free models. DO NOT leave the 'models' array empty for free providers. Dig deep and find them.\\n";
    promptText += "10. If a provider genuinely has no free tier at all, ONLY THEN set \\\"hasFree\\\": false and leave \\\"models\\\": [].\\n";
    promptText += "11. Use the 'status' field for EVERY provider to provide a VERY SHORT but COMPREHENSIVE summary. You MUST include: whether it has a free tier, requests per minute (RPM), requests per day (RPD), context window size, tokens per minute/day, and whether the limits are daily or per minute. Give full details but keep it extremely concise and to the point (e.g., 'Free tier: 15 RPM, 200 RPD, 128k Ctx, 1M TPM' or 'Paid only, no free tier'). DO NOT write long paragraphs, use slashes/commas.\\n\\n";
    promptText += "Here is the current data to review and fix:\\n\\n";

    promptText += JSON.stringify(providersData, null, 2);

    // Convert literal \n strings to actual newlines for the clipboard
    const finalPrompt = promptText.replace(/\\n/g, '\n');
    navigator.clipboard.writeText(finalPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportData = () => {
    const dataToExport = displayVersion === 1 ? providersData : (backupData || []);
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `providersInfo_v${displayVersion}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadBackup = async () => {
    setImportError('');
    setIsLoadingBackup(true);
    try {
      const res = await fetch('/api/admin/providers/get-backup', { headers: getAuthHeaders() });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to load backup');

      setImportJson(JSON.stringify(result.data, null, 2));
    } catch (e: any) {
      setImportError(e.message || 'Error loading backup');
    } finally {
      setIsLoadingBackup(false);
    }
  };

  const handleImportSubmit = async () => {
    setImportError('');
    setIsSavingImport(true);
    try {
      // Try to parse the JSON first
      let cleanJson = importJson.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.substring(7);
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.substring(3);
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
      }

      const parsedData = JSON.parse(cleanJson);

      const res = await fetch('/api/admin/providers/update-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(parsedData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setProvidersData(parsedData);
      setShowImportModal(false);
      showToast('Providers updated successfully!');
    } catch (e: any) {
      setImportError(e.message || 'Invalid JSON format');
    } finally {
      setIsSavingImport(false);
    }
  };


  return (
    <div>
      {/* ===== PAGE HEADER ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/admin/providers" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, padding: '6px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-card-bg)' }}>
            <ChevronLeft size={15} /> Back
          </Link>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 2px 0' }}>Provider Routing &amp; Keys</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: 0 }}>Manage API keys and dynamically add providers and models.</p>
          </div>
        </div>

        {/* ===== HEADER ACTION BUTTONS ===== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => fetchProviders()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={handleSave} disabled={saving || loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '8px' }}>
            <Save size={15} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading Providers...</span>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        </div>
      ) : (
        <>
          {/* ===== ADD PROVIDER FORM (shows below header when open) ===== */}
          {showAddProvider && (
            <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', padding: '24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>New Custom Provider</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider ID</label>
                  <input type="text" value={newProvId} onChange={(e) => setNewProvId(e.target.value)} placeholder="e.g. custom_openai"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                </div>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider Name</label>
                  <input type="text" value={newProvName} onChange={(e) => setNewProvName(e.target.value)} placeholder="e.g. My Custom Provider"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider Icon URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={newProvIcon} onChange={(e) => setNewProvIcon(e.target.value)} placeholder="e.g. https://cdn.simpleicons.org/openai/10A37F"
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                    <select value={newProvIcon} onChange={(e) => setNewProvIcon(e.target.value)}
                      style={{ width: '130px', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}>
                      <option value="">Custom...</option>
                      <option value="https://cdn.simpleicons.org/openai/10A37F">OpenAI / Generic AI</option>
                      <option value="https://cdn.simpleicons.org/anthropic/D97757">Anthropic</option>
                      <option value="https://cdn.simpleicons.org/google/4285F4">Google</option>
                      <option value="https://cdn.simpleicons.org/meta/0668E1">Meta</option>
                      <option value="https://cdn.simpleicons.org/x/000000">X.AI</option>
                      <option value="https://cdn.simpleicons.org/deepseek/4D8B3D">DeepSeek</option>
                    </select>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Paste an image URL or pick from presets</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Base URL</label>
                  <input type="text" value={newProvBaseUrl} onChange={(e) => setNewProvBaseUrl(e.target.value)} placeholder="e.g. https://api.openai.com/v1" autoComplete="off"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                </div>
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Format</label>
                  <select value={newProvApiFormat} onChange={(e) => setNewProvApiFormat(e.target.value)}
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }}>
                    <option value="" disabled>Select API Format</option>
                    <option value="OpenAI Compatible">OpenAI Compatible</option>
                    <option value="OpenAI Responses">OpenAI Responses</option>
                    <option value="Anthropic Messages">Anthropic Messages</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Root API Key</label>
                  <input type="password" value={newProvKey} onChange={(e) => setNewProvKey(e.target.value)} placeholder="sk-..." autoComplete="new-password"
                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                </div>
              </div>

              {/* Custom Headers in form */}
              <div style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Custom Headers</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {newProvHeaders.map((header, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" value={header.key}
                        onChange={(e) => { const next = [...newProvHeaders]; next[idx].key = e.target.value; setNewProvHeaders(next); }}
                        placeholder="Header Key (e.g. HTTP-Referer)"
                        style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-text-main)', outline: 'none' }} />
                      <input type="text" value={header.value}
                        onChange={(e) => { const next = [...newProvHeaders]; next[idx].value = e.target.value; setNewProvHeaders(next); }}
                        placeholder="Header Value"
                        style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-text-main)', outline: 'none' }} />
                      <button onClick={() => setNewProvHeaders(newProvHeaders.filter((_, i) => i !== idx))}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setNewProvHeaders([...newProvHeaders, { id: Date.now().toString(), key: '', value: '' }])}
                    style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '12px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    + Add Header
                  </button>
                </div>
              </div>

              {/* Models in form */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Configure Models</h4>
                  <button onClick={() => setNewProvModels([...newProvModels, { id: '', name: '', originalId: '', reasoning: false, image: false }])}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Add Model
                  </button>
                </div>
                {newProvModels.map((model, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)', position: 'relative', marginBottom: '8px' }}>
                    <button onClick={() => setNewProvModels(newProvModels.filter((_, i) => i !== idx))}
                      style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingRight: '24px' }}>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Original Model ID</label>
                        <input type="text" value={model.originalId || ''} onChange={(e) => { const next = [...newProvModels]; next[idx].originalId = e.target.value; setNewProvModels(next); }} placeholder="e.g. gpt-4"
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model Name</label>
                        <input type="text" value={model.name} onChange={(e) => { const next = [...newProvModels]; next[idx].name = e.target.value; setNewProvModels(next); }} placeholder="e.g. GPT-4"
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model ID</label>
                      <input type="text" value={model.id} onChange={(e) => { const next = [...newProvModels]; next[idx].id = e.target.value; setNewProvModels(next); }} placeholder="e.g. cr-gpt-4"
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '13px' }} />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>* Users calling our API will use this ID, but will see the &quot;Showing Model Name&quot; in the UI.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.reasoning} onChange={(e) => { const next = [...newProvModels]; next[idx].reasoning = e.target.checked; setNewProvModels(next); }} /> Reasoning
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={model.image} onChange={(e) => { const next = [...newProvModels]; next[idx].image = e.target.checked; setNewProvModels(next); }} /> Image
                      </label>
                    </div>
                  </div>
                ))}
                {newProvModels.length === 0 && <span style={{
                  fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic'
                }}>No initial models added.</span>}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="btn-primary" onClick={handleAddProvider} style={{ padding: '10px 24px' }}>Create Provider</button>
                <button onClick={() => setShowAddProvider(false)} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* ===== CUSTOM PROVIDERS ===== */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>Custom Providers</h3>
              <button
                onClick={() => { setShowAddProvider(!showAddProvider); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '8px', background: showAddProvider ? 'var(--color-primary)' : 'transparent', border: showAddProvider ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', color: showAddProvider ? 'white' : 'var(--color-text-main)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Plus size={14} /> {showAddProvider ? 'Close Form' : 'Add Custom Provider'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {providers.filter(p => p.isCustom && !p.id.startsWith('ap_') && p.id !== 'openrouter' && p.id !== 'opencode').map(provider => renderProviderTile(provider, true))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
            <div style={{ width: '50%', height: '1px', background: 'var(--color-border)', opacity: 0.6 }} />
          </div>

          {/* ===== PREFIX PROVIDERS ===== */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>Prefix Providers</h3>
                <button
                  onClick={() => setShowInfoSheet(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Info size={14} /> Free Providers
                </button>
              </div>
              <button
                className="btn-secondary"
                onClick={handleTestAllPrefixProviders}
                disabled={testingAll}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
              >
                <Play size={14} /> {testingAll ? 'Testing...' : 'Test All Prefix Providers'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              <OpenRouterSetup ref={openRouterRef} index={1} byokEnabled={getByokStatus('ap_openrouter', 'openrouter')} onToggleByok={() => toggleByokProvider('ap_openrouter', 'OpenRouter')} onModelsUpdated={() => fetchProviders(true)} />
              <OpenCodeSetup ref={openCodeRef} index={2} byokEnabled={getByokStatus('ap_opencode', 'opencode')} onToggleByok={() => toggleByokProvider('ap_opencode', 'OpenCode')} onModelsUpdated={() => fetchProviders(true)} />
              <OpenAISetup ref={openaiRef} index={3} byokEnabled={getByokStatus('ap_openai')} onToggleByok={() => toggleByokProvider('ap_openai', 'OpenAI')} onModelsUpdated={() => fetchProviders(true)} />
              <AnthropicSetup ref={anthropicRef} index={4} byokEnabled={getByokStatus('ap_anthropic')} onToggleByok={() => toggleByokProvider('ap_anthropic', 'Anthropic')} onModelsUpdated={() => fetchProviders(true)} />
              <CohereSetup ref={cohereRef} index={5} byokEnabled={getByokStatus('ap_cohere')} onToggleByok={() => toggleByokProvider('ap_cohere', 'Cohere')} onModelsUpdated={() => fetchProviders(true)} />
              <GroqSetup ref={groqRef} index={6} byokEnabled={getByokStatus('ap_groq')} onToggleByok={() => toggleByokProvider('ap_groq', 'Groq')} onModelsUpdated={() => fetchProviders(true)} />
              <GoogleSetup ref={googleRef} index={7} byokEnabled={getByokStatus('ap_google')} onToggleByok={() => toggleByokProvider('ap_google', 'Google')} onModelsUpdated={() => fetchProviders(true)} />
              <CerebrasSetup ref={cerebrasRef} index={8} byokEnabled={getByokStatus('ap_cerebras')} onToggleByok={() => toggleByokProvider('ap_cerebras', 'Cerebras')} onModelsUpdated={() => fetchProviders(true)} />
              <SambaNovaSetup ref={sambanovaRef} index={9} byokEnabled={getByokStatus('ap_sambanova')} onToggleByok={() => toggleByokProvider('ap_sambanova', 'SambaNova')} onModelsUpdated={() => fetchProviders(true)} />
              <XAISetup ref={xaiRef} index={10} byokEnabled={getByokStatus('ap_xai')} onToggleByok={() => toggleByokProvider('ap_xai', 'xAI')} onModelsUpdated={() => fetchProviders(true)} />
              <NovitaSetup ref={novitaRef} index={11} byokEnabled={getByokStatus('ap_novita')} onToggleByok={() => toggleByokProvider('ap_novita', 'Novita')} onModelsUpdated={() => fetchProviders(true)} />
              <BytezSetup ref={bytezRef} index={12} byokEnabled={getByokStatus('ap_bytez')} onToggleByok={() => toggleByokProvider('ap_bytez', 'Bytez')} onModelsUpdated={() => fetchProviders(true)} />
              <AIMLAPISetup ref={aimlapiRef} index={13} byokEnabled={getByokStatus('ap_aimlapi')} onToggleByok={() => toggleByokProvider('ap_aimlapi', 'AIMLAPI')} onModelsUpdated={() => fetchProviders(true)} />
              <TokenHarborSetup ref={tokenharborRef} index={14} byokEnabled={getByokStatus('ap_tokenharbor')} onToggleByok={() => toggleByokProvider('ap_tokenharbor', 'TokenHarbor')} onModelsUpdated={() => fetchProviders(true)} />
              <AIANDSetup ref={aiandRef} index={15} byokEnabled={getByokStatus('ap_aiand')} onToggleByok={() => toggleByokProvider('ap_aiand', 'AIAND')} onModelsUpdated={() => fetchProviders(true)} />
              <MistralSetup ref={mistralRef} index={16} byokEnabled={getByokStatus('ap_mistral')} onToggleByok={() => toggleByokProvider('ap_mistral', 'Mistral')} onModelsUpdated={() => fetchProviders(true)} />
              <TogetherSetup ref={togetherRef} index={17} byokEnabled={getByokStatus('ap_together')} onToggleByok={() => toggleByokProvider('ap_together', 'Together')} onModelsUpdated={() => fetchProviders(true)} />
              <DeepSeekSetup ref={deepseekRef} index={18} byokEnabled={getByokStatus('ap_deepseek')} onToggleByok={() => toggleByokProvider('ap_deepseek', 'DeepSeek')} onModelsUpdated={() => fetchProviders(true)} />
              <FireworksSetup ref={fireworksRef} index={19} byokEnabled={getByokStatus('ap_fireworks')} onToggleByok={() => toggleByokProvider('ap_fireworks', 'Fireworks')} onModelsUpdated={() => fetchProviders(true)} />
              <PerplexitySetup ref={perplexityRef} index={20} byokEnabled={getByokStatus('ap_perplexity')} onToggleByok={() => toggleByokProvider('ap_perplexity', 'Perplexity')} onModelsUpdated={() => fetchProviders(true)} />
              <AmazonBedrockSetup ref={amazonbedrockRef} index={21} byokEnabled={getByokStatus('ap_amazonbedrock')} onToggleByok={() => toggleByokProvider('ap_amazonbedrock', 'Amazon Bedrock')} onModelsUpdated={() => fetchProviders(true)} />
              <GithubSetup ref={githubRef} index={22} byokEnabled={getByokStatus('ap_github')} onToggleByok={() => toggleByokProvider('ap_github', 'GitHub Models')} onModelsUpdated={() => fetchProviders(true)} />
              <HuggingFaceSetup ref={huggingfaceRef} index={23} byokEnabled={getByokStatus('ap_huggingface')} onToggleByok={() => toggleByokProvider('ap_huggingface', 'Hugging Face')} onModelsUpdated={() => fetchProviders(true)} />
              <HyperbolicSetup ref={hyperbolicRef} index={24} byokEnabled={getByokStatus('ap_hyperbolic')} onToggleByok={() => toggleByokProvider('ap_hyperbolic', 'Hyperbolic')} onModelsUpdated={() => fetchProviders(true)} />
              <MoonshotSetup ref={moonshotRef} index={25} byokEnabled={getByokStatus('ap_moonshot')} onToggleByok={() => toggleByokProvider('ap_moonshot', 'Moonshot')} onModelsUpdated={() => fetchProviders(true)} />
              <ZaiSetup ref={zaiRef} index={26} byokEnabled={getByokStatus('ap_zai')} onToggleByok={() => toggleByokProvider('ap_zai', 'ZAI')} onModelsUpdated={() => fetchProviders(true)} />
              <NvidiaSetup ref={nvidiaRef} index={27} byokEnabled={getByokStatus('ap_nvidia')} onToggleByok={() => toggleByokProvider('ap_nvidia', 'Nvidia')} onModelsUpdated={() => fetchProviders(true)} />
              <KiloCodeSetup ref={kilocodeRef} index={28} byokEnabled={getByokStatus('ap_kilocode')} onToggleByok={() => toggleByokProvider('ap_kilocode', 'Kilo Code')} onModelsUpdated={() => fetchProviders(true)} />
              <ClineCodeSetup ref={clinecodeRef} index={29} byokEnabled={getByokStatus('ap_clinecode')} onToggleByok={() => toggleByokProvider('ap_clinecode', 'Cline Code')} onModelsUpdated={() => fetchProviders(true)} />
              <PoixeSetup ref={poixeRef} index={30} byokEnabled={getByokStatus('ap_poixe')} onToggleByok={() => toggleByokProvider('ap_poixe', 'Poixe')} onModelsUpdated={() => fetchProviders(true)} />
              <SiliconFlowSetup ref={siliconflowRef} index={31} byokEnabled={getByokStatus('ap_siliconflow')} onToggleByok={() => toggleByokProvider('ap_siliconflow', 'SiliconFlow')} onModelsUpdated={() => fetchProviders(true)} />
              <ZenmuxSetup ref={zenmuxRef} index={32} byokEnabled={getByokStatus('ap_zenmux')} onToggleByok={() => toggleByokProvider('ap_zenmux', 'Zenmux')} onModelsUpdated={() => fetchProviders(true)} />
              <UnoRouterSetup ref={unorouterRef} index={33} byokEnabled={getByokStatus('ap_unorouter')} onToggleByok={() => toggleByokProvider('ap_unorouter', 'UnoRouter')} onModelsUpdated={() => fetchProviders(true)} />
              <RoutewaySetup ref={routewayRef} index={34} byokEnabled={getByokStatus('ap_routeway')} onToggleByok={() => toggleByokProvider('ap_routeway', 'Routeway')} onModelsUpdated={() => fetchProviders(true)} />
              <StepFunSetup ref={stepfunRef} index={35} byokEnabled={getByokStatus('ap_stepfun')} onToggleByok={() => toggleByokProvider('ap_stepfun', 'StepFun')} onModelsUpdated={() => fetchProviders(true)} />
              <LLM7Setup ref={llm7Ref} index={36} byokEnabled={getByokStatus('ap_llm7')} onToggleByok={() => toggleByokProvider('ap_llm7', 'LLM7')} onModelsUpdated={() => fetchProviders(true)} />
              <ModelScopeSetup ref={modelscopeRef} index={37} byokEnabled={getByokStatus('ap_modelscope')} onToggleByok={() => toggleByokProvider('ap_modelscope', 'ModelScope')} onModelsUpdated={() => fetchProviders(true)} />
              <AIHordeSetup ref={aihordeRef} index={38} byokEnabled={getByokStatus('ap_aihorde')} onToggleByok={() => toggleByokProvider('ap_aihorde', 'AI Horde')} onModelsUpdated={() => fetchProviders(true)} />
              <PollinationsSetup ref={pollinationsRef} index={39} byokEnabled={getByokStatus('ap_pollinations')} onToggleByok={() => toggleByokProvider('ap_pollinations', 'Pollinations')} onModelsUpdated={() => fetchProviders(true)} />
              <AnyRouterSetup ref={anyrouterRef} index={40} byokEnabled={getByokStatus('ap_anyrouter')} onToggleByok={() => toggleByokProvider('ap_anyrouter', 'AnyRouter')} onModelsUpdated={() => fetchProviders(true)} />
              <AgnesAISetup ref={agnesaiRef} index={41} byokEnabled={getByokStatus('ap_agnesai')} onToggleByok={() => toggleByokProvider('ap_agnesai', 'Agnes AI')} onModelsUpdated={() => fetchProviders(true)} />
              <TokenRouterSetup ref={tokenrouterRef} index={42} byokEnabled={getByokStatus('ap_tokenrouter')} onToggleByok={() => toggleByokProvider('ap_tokenrouter', 'TokenRouter')} onModelsUpdated={() => fetchProviders(true)} />
            </div>
          </div>
        </>
      )}

      {/* ===== INFO & LIMITS SIDE SHEET ===== */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: showInfoSheet ? 0 : '-420px',
          width: '400px',
          height: '100vh',
          background: 'var(--color-card-bg)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: showInfoSheet ? '-5px 0 25px rgba(0,0,0,0.1)' : 'none',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', position: 'relative' }}>
          <button onClick={() => setShowInfoSheet(false)} style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
            <X size={20} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingRight: '28px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, margin: 0, color: 'var(--color-text-muted)' }}>
              Total: {displayVersion === 1 ? providersData.length : (backupData?.length || 0)}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 10px 4px 28px', fontSize: '12px', color: 'var(--color-text)', width: '160px', outline: 'none' }}
                />
              </div>
              <button
                onClick={handleCopyPrompt}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isCopied ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-primary)', color: isCopied ? '#10b981' : 'white', border: isCopied ? '1px solid #10b981' : '1px solid transparent', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}
                title="Copy details as a prompt to verify with another AI"
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />} {isCopied ? 'Copied!' : 'Prompt'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleToggleVersion(1)}
              style={{ background: displayVersion === 1 ? 'var(--color-primary)' : 'var(--color-bg-subtle)', color: displayVersion === 1 ? 'white' : 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              1 (New)
            </button>
            <button
              onClick={() => handleToggleVersion(2)}
              style={{ background: displayVersion === 2 ? 'var(--color-primary)' : 'var(--color-bg-subtle)', color: displayVersion === 2 ? 'white' : 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              2 (Old)
            </button>
            <div style={{ width: '1px', height: '14px', background: 'var(--color-border)', margin: '0 4px' }}></div>
            <button
              onClick={() => {
                setImportJson(JSON.stringify(displayVersion === 1 ? providersData : (backupData || []), null, 2));
                setShowImportModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-bg-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}
              title="Edit displayed data manually"
            >
              <Edit size={12} /> Edit
            </button>
            <button
              onClick={() => {
                setImportJson('');
                setShowImportModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-bg-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}
              title="Import verified data"
            >
              <Upload size={12} /> Import
            </button>
            <button
              onClick={handleExportData}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-bg-subtle)', color: 'var(--color-text)', border: '1px solid var(--color-border)', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}
              title="Export displayed data as JSON"
            >
              <Download size={12} /> Export
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(() => {
            const currentList = displayVersion === 1 ? providersData : (backupData || []);
            const filteredList = currentList.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase())));

            if (currentList.length === 0) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', color: 'var(--color-text-muted)', minHeight: '200px' }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>No data available in this version.</p>
                  <button
                    onClick={() => {
                      setImportJson('');
                      setShowImportModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}
                  >
                    <Upload size={16} /> Import Data
                  </button>
                </div>
              );
            }

            if (filteredList.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  No providers found matching "{searchQuery}"
                </div>
              );
            }

            return filteredList.map((provider, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: provider.tagColor }}>
                    {i + 1}. {provider.name}
                  </h4>
                  <span style={{ fontSize: '9px', background: `${provider.tagColor}1A`, color: provider.tagColor, padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
                    {provider.tag}
                  </span>
                  {(provider as any).website && (
                    <a
                      href={(provider as any).website}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--color-text-muted)',
                        textDecoration: 'none',
                        marginLeft: 'auto',
                        padding: '2px',
                        borderRadius: '4px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = provider.tagColor}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                      title={`Visit ${(provider as any).name} Website`}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                {provider.hasFree && provider.models.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px', paddingLeft: '8px' }}>
                    {provider.models.map((model: any, mIdx: number) => (
                      <div key={mIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-main)', fontWeight: 600 }}>{model.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>({model.id})</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {model.badges.map((badge: string, bIdx: number) => (
                            <span key={bIdx} style={{ fontSize: '10px', color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '0 4px', borderRadius: '3px' }}>
                              {badge}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, marginLeft: '4px' }}>
                          Limits: <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>{model.limit}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {provider.status && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Status:</span> <span style={{ whiteSpace: 'pre-line' }}>{provider.status}</span>
                  </div>
                )}

                {!provider.hasFree && !provider.status && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '8px', fontWeight: 600 }}>
                    No free models available
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '500px', maxWidth: '90vw', background: 'var(--color-bg-base)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', boxShadow: '5px 0 25px rgba(0,0,0,0.2)', transition: 'left 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Data Editor</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => monacoEditorRef.current?.getAction('actions.find')?.run()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                  title="Search in editor (Ctrl+F)"
                >
                  <Search size={14} /> Search
                </button>
                <div style={{ width: '1px', height: '14px', background: 'var(--color-border)' }}></div>
                <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} title="Close Editor">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, width: '100%', position: 'relative' }}>
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={importJson}
                onChange={(value) => setImportJson(value || '')}
                onMount={(editor) => {
                  monacoEditorRef.current = editor;
                }}
                options={editorOptions}
              />
            </div>

            {importError && (
              <div style={{ padding: '6px 12px', background: '#3f1616', borderTop: '1px solid #ff6b6b', color: '#ff6b6b', fontSize: '11px' }}>
                {importError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
              <button
                onClick={handleLoadBackup}
                disabled={isLoadingBackup}
                style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', cursor: isLoadingBackup ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Load the previously saved version"
              >
                {isLoadingBackup ? <RefreshCw size={12} className={styles.spin} /> : <History size={12} />}
                Load Backup
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowImportModal(false)}
                  style={{ background: 'none', color: 'var(--color-text)', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={isSavingImport || !importJson.trim()}
                  style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: (isSavingImport || !importJson.trim()) ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 600, opacity: (isSavingImport || !importJson.trim()) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSavingImport ? <RefreshCw size={12} className={styles.spin} /> : <Save size={12} />}
                  {isSavingImport ? 'Saving...' : 'Save Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for sheet */}
      {showInfoSheet && (
        <div
          onClick={() => setShowInfoSheet(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9998, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ===== CUSTOM PROVIDER MODELS RIGHT-SIDE DRAWER ===== */}
      {drawerProviderId && (() => {
        const prov = providers.find(p => p.id === drawerProviderId);
        if (!prov) return null;

        const filteredModels = drawerAvailableModels.filter(m => {
          const q = drawerSearchQuery.toLowerCase();
          return (m.id && m.id.toLowerCase().includes(q)) || (m.name && m.name.toLowerCase().includes(q));
        });

        const rawJsonUrl = prov.modelsApiLink 
          ? prov.modelsApiLink 
          : prov.baseUrl 
            ? `${prov.baseUrl.replace(/\/+$/, '')}/models` 
            : '';

        const provKeys = parseKeys(prov.key);
        const activeKeysCount = provKeys.filter(k => k.active && k.key.trim()).length;

        // Combined models for Test tab model selector
        const combinedModels = [
          ...drawerAvailableModels.map(m => ({ id: m.id, name: m.name || m.id })),
          ...prov.models.filter(sm => !drawerAvailableModels.some(am => am.id === (sm.originalId || sm.id))).map(sm => ({ id: sm.originalId || sm.id, name: sm.name || sm.id }))
        ];

        // Compute capabilities of currently chosen test model
        const currentTestModelObj = drawerAvailableModels.find(m => m.id === drawerTestModelId) || prov.models.find(m => (m.originalId || m.id) === drawerTestModelId);

        const getCustomModelCapabilities = (modelObj: any): string[] => {
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

        const customCapabilities = getCustomModelCapabilities(currentTestModelObj);

        return (
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
            onClick={handleCloseDrawer}
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
                  {prov.icon ? (
                    <img src={prov.icon} alt={prov.name} style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  ) : (
                    <Layers size={20} color="var(--color-primary)" />
                  )}
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                      {prov.name}
                    </h2>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {prov.baseUrl || 'Custom Endpoint'}
                    </span>
                  </div>
                </div>

                {/* TWO TABS IN HEADER: MANAGE & TEST */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-input-bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => setCustomDrawerTab('manage')}
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
                      background: customDrawerTab === 'manage' ? 'var(--color-primary)' : 'transparent',
                      color: customDrawerTab === 'manage' ? '#ffffff' : 'var(--color-text-muted)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Sliders size={13} /> Manage
                  </button>
                  <button
                    onClick={() => setCustomDrawerTab('test')}
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
                      background: customDrawerTab === 'test' ? 'var(--color-primary)' : 'transparent',
                      color: customDrawerTab === 'test' ? '#ffffff' : 'var(--color-text-muted)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Sparkles size={13} /> Test
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleCloseDrawer}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                  title="Close Sheet"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ============================================================ */}
              {/* VIEW 1: MANAGE TAB                                           */}
              {/* ============================================================ */}
              {customDrawerTab === 'manage' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* 1. COLLAPSIBLE API KEYS SECTION */}
                  <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-card-bg)' }}>
                    <div
                      onClick={() => setCustomDrawerKeysCollapsed(!customDrawerKeysCollapsed)}
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
                        {customDrawerKeysCollapsed ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronUp size={15} color="var(--color-text-muted)" />}
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          API Keys ({provKeys.filter(k => k.key.trim()).length})
                        </span>
                        {customDrawerKeysCollapsed && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            • {activeKeysCount} Active
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {customDrawerKeysCollapsed ? 'Click to expand' : 'Click to collapse'}
                      </span>
                    </div>

                    {!customDrawerKeysCollapsed && (
                      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {provKeys.map((kObj, idx) => {
                          const keyId = `${prov.id}_${idx}`;
                          const isTesting = testingCustomKey[keyId];
                          const testStatus = testCustomSuccess[keyId];
                          const isKeyVisible = showCustomKeys[keyId];

                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: kObj.active ? 1 : 0.6 }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type={isKeyVisible ? 'text' : 'password'}
                                    value={kObj.key}
                                    onChange={(e) => updateKeyIndex(prov.id, idx, e.target.value)}
                                    placeholder="Enter API Key"
                                    disabled={!kObj.active}
                                    autoComplete="new-password"
                                    style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '7px 32px 7px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px', fontFamily: 'monospace' }}
                                  />
                                  <button
                                    className="btn-secondary"
                                    onClick={() => setShowCustomKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))}
                                    style={{ position: 'absolute', right: '4px', background: 'transparent', border: 'none', padding: '4px', color: 'var(--color-text-muted)' }}
                                    title={isKeyVisible ? 'Hide Key' : 'Show Key'}
                                  >
                                    {isKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>

                                <button
                                  className="btn-secondary"
                                  onClick={() => toggleKeyActive(prov.id, idx)}
                                  style={{ padding: '7px 9px', display: 'flex', alignItems: 'center', height: '32px', color: kObj.active ? '#eab308' : '#10b981' }}
                                  title={kObj.active ? 'Pause Key' : 'Resume Key'}
                                >
                                  {kObj.active ? <Pause size={13} /> : <Play size={13} />}
                                </button>

                                <button
                                  className="btn-secondary"
                                  onClick={() => handleTestCustomKey(prov, idx)}
                                  disabled={isTesting || !kObj.active}
                                  style={{
                                    padding: '7px 9px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '32px',
                                    color: testStatus === true ? '#10b981' : testStatus === false ? '#ef4444' : 'inherit'
                                  }}
                                  title="Test Key"
                                >
                                  {isTesting ? (
                                    <RefreshCw size={13} className={styles.spin} />
                                  ) : testStatus === true ? (
                                    <Check size={13} />
                                  ) : testStatus === false ? (
                                    <X size={13} />
                                  ) : (
                                    <Play size={13} />
                                  )}
                                </button>

                                {idx > 0 && (
                                  <button
                                    className="btn-secondary"
                                    onClick={() => removeKey(prov.id, idx)}
                                    style={{ padding: '7px 8px', display: 'flex', alignItems: 'center', height: '32px', color: '#ef4444' }}
                                    title="Remove Key"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => addKey(prov.id)}
                            style={{ flex: 1, justifyContent: 'center', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px' }}
                          >
                            <Plus size={12} /> Add Key
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => handleSaveCustomProvider(prov.id)}
                            disabled={saving}
                            style={{ flex: 1, justifyContent: 'center', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', height: '28px', color: saved ? '#10b981' : undefined, borderColor: saved ? '#10b981' : undefined }}
                            title="Save All Keys"
                          >
                            {saving ? <RefreshCw size={12} className={styles.spin} /> : <Save size={12} />} Save Keys
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. COLLAPSIBLE AVAILABLE MODELS SELECTION */}
                  <div
                    style={{
                      flex: customDrawerAvailableCollapsed ? 'none' : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      borderBottom: '1px solid var(--color-border)',
                      minHeight: customDrawerAvailableCollapsed ? 'auto' : '180px'
                    }}
                  >
                    <div
                      onClick={() => setCustomDrawerAvailableCollapsed(!customDrawerAvailableCollapsed)}
                      style={{
                        padding: '8px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'var(--color-bg-soft)',
                        borderBottom: customDrawerAvailableCollapsed ? 'none' : '1px solid var(--color-border)',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {customDrawerAvailableCollapsed ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronUp size={15} color="var(--color-text-muted)" />}
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          Available Models ({drawerAvailableModels.length})
                        </span>
                        {customDrawerAvailableCollapsed && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            • {prov.models.length} Selected
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {customDrawerAvailableCollapsed ? 'Click to expand' : 'Click to collapse'}
                      </span>
                    </div>

                    {!customDrawerAvailableCollapsed && (
                      <>
                        <div style={{ padding: '8px 18px', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--color-card-bg)', borderBottom: '1px solid var(--color-border)' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={13} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--color-text-muted)' }} />
                            <input
                              type="text"
                              placeholder="Search models..."
                              value={drawerSearchQuery}
                              onChange={e => setDrawerSearchQuery(e.target.value)}
                              style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 10px 5px 30px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }}
                            />
                          </div>
                          <button
                            className="btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFetchCustomModels(prov);
                            }}
                            disabled={fetchingDrawerModels}
                            style={{ padding: '5px 10px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', height: '28px' }}
                          >
                            <RefreshCw size={12} className={fetchingDrawerModels ? styles.spin : ''} />
                            {fetchingDrawerModels ? 'Loading...' : 'Load API'}
                          </button>
                          {rawJsonUrl && (
                            <a
                              href={rawJsonUrl}
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
                          <button
                            className="btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDrawerManualAdd(!showDrawerManualAdd);
                            }}
                            style={{ padding: '5px 8px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', height: '28px' }}
                            title="Add custom model manually"
                          >
                            <Plus size={12} /> Manual
                          </button>
                        </div>

                        {/* Manual Model Add Form */}
                        {showDrawerManualAdd && (
                          <div style={{ padding: '10px 18px', background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ADD CUSTOM MODEL MANUALLY</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input
                                type="text"
                                placeholder="Model ID (e.g. gpt-4o)"
                                value={drawerManualId}
                                onChange={e => setDrawerManualId(e.target.value)}
                                style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                              />
                              <input
                                type="text"
                                placeholder="Display Name (e.g. GPT-4o)"
                                value={drawerManualName}
                                onChange={e => setDrawerManualName(e.target.value)}
                                style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                              />
                              <button
                                className="btn-primary"
                                onClick={handleAddManualDrawerModel}
                                disabled={!drawerManualId.trim() || !drawerManualName.trim()}
                                style={{ padding: '5px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Drawer Error Banner */}
                        {drawerError && (
                          <div style={{ margin: '8px 18px', padding: '6px 10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', borderRadius: '6px', fontSize: '11px' }}>
                            {drawerError}
                          </div>
                        )}

                        {/* Available models list */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {filteredModels.map(model => {
                            const isSelected = prov.models.some(m => (m.originalId || m.id) === model.id);
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
                                  onChange={() => toggleCustomDrawerModel(model)}
                                  style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {model.name || model.id}
                                    </span>
                                    {model.context_length ? (
                                      <span style={{ fontSize: '10px', color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
                                        {Math.round(model.context_length / 1000)}K
                                      </span>
                                    ) : null}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {model.id}
                                    </span>
                                    <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', opacity: 0.8, textTransform: 'uppercase' }}>
                                      {model.architecture?.modality || 'TEXT'}
                                    </span>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                          {drawerAvailableModels.length === 0 && !fetchingDrawerModels && !drawerError && (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                              Click <strong>&quot;Load API&quot;</strong> to fetch models from {prov.name}, or click <strong>&quot;Manual&quot;</strong> to add one manually.
                            </div>
                          )}
                          {drawerAvailableModels.length > 0 && filteredModels.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                              No models matching &quot;{drawerSearchQuery}&quot;
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
                      flex: customDrawerAvailableCollapsed && !customDrawerSelectedCollapsed ? 1 : undefined,
                      maxHeight: customDrawerSelectedCollapsed ? 'auto' : (customDrawerAvailableCollapsed ? 'none' : '40%'),
                      minHeight: customDrawerSelectedCollapsed ? 'auto' : '150px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      onClick={() => setCustomDrawerSelectedCollapsed(!customDrawerSelectedCollapsed)}
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
                        {customDrawerSelectedCollapsed ? <ChevronDown size={15} color="var(--color-text-muted)" /> : <ChevronUp size={15} color="var(--color-text-muted)" />}
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>Selected Models</span>
                        <span style={{ background: 'var(--color-primary)', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                          {prov.models.length}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {customDrawerSelectedCollapsed ? 'Click to expand' : 'Click to collapse'}
                      </span>
                    </div>

                    {!customDrawerSelectedCollapsed && (
                      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {prov.models.map(model => {
                          const origId = model.originalId || model.id;
                          return (
                            <div
                              key={origId}
                              style={{
                                background: 'var(--color-card-bg)',
                                border: '1px solid var(--color-border)',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span>Original: </span>
                                  <strong style={{ color: 'var(--color-text-main)', fontFamily: 'monospace', fontSize: '11px' }}>
                                    {origId}
                                  </strong>
                                </div>
                                <button
                                  onClick={() => toggleCustomDrawerModel({ id: origId })}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                  title="Remove Model"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Name</label>
                                  <input
                                    type="text"
                                    value={model.name}
                                    onChange={(e) => updateCustomDrawerModelField(origId, 'name', e.target.value)}
                                    placeholder="e.g. GPT-4o"
                                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                                  />
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing ID</label>
                                  <input
                                    type="text"
                                    value={model.id}
                                    onChange={(e) => updateCustomDrawerModelField(origId, 'id', e.target.value)}
                                    placeholder="e.g. gpt-4o"
                                    style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-main)', outline: 'none' }}
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                  <input type="checkbox" checked={model.text !== false} onChange={(e) => updateCustomDrawerModelField(origId, 'text', e.target.checked)} />
                                  Text
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                  <input type="checkbox" checked={!!model.image} onChange={(e) => updateCustomDrawerModelField(origId, 'image', e.target.checked)} />
                                  Image
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                  <input type="checkbox" checked={!!model.vision} onChange={(e) => updateCustomDrawerModelField(origId, 'vision', e.target.checked)} />
                                  Vision
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                  <input type="checkbox" checked={!!model.audio} onChange={(e) => updateCustomDrawerModelField(origId, 'audio', e.target.checked)} />
                                  Audio
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                  <input type="checkbox" checked={!!model.reasoning} onChange={(e) => updateCustomDrawerModelField(origId, 'reasoning', e.target.checked)} />
                                  Reasoning
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                  <input type="checkbox" checked={!!model.video} onChange={(e) => updateCustomDrawerModelField(origId, 'video', e.target.checked)} />
                                  Video
                                </label>
                              </div>
                            </div>
                          );
                        })}
                        {prov.models.length === 0 && (
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
                      onClick={handleCloseDrawer}
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
              {customDrawerTab === 'test' && (
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
                        value={drawerTestModelId}
                        onChange={(e) => {
                          setDrawerTestModelId(e.target.value);
                          setCustomTestResponse(null);
                        }}
                        style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '7px 10px', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-main)', outline: 'none' }}
                      >
                        <option value="" disabled>Select model...</option>
                        {combinedModels.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id})
                          </option>
                        ))}
                      </select>

                      {/* Reload models button */}
                      <button
                        className="btn-secondary"
                        onClick={() => handleFetchCustomModels(prov)}
                        disabled={fetchingDrawerModels}
                        style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', height: '33px' }}
                        title="Reload models from API"
                      >
                        <RefreshCw size={13} className={fetchingDrawerModels ? styles.spin : ''} />
                        {fetchingDrawerModels ? 'Loading...' : 'Reload'}
                      </button>
                    </div>

                    {/* Capabilities display (grey pills separated by commas) */}
                    {drawerTestModelId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Capabilities:</span>
                        {customCapabilities.map((cap, i) => (
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
                            {i < customCapabilities.length - 1 && <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>,</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. TEST TYPE SELECTOR (Text vs Vision vs Image) */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleSelectCustomTestType('text')}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: customTestType === 'text' ? 'var(--color-primary)' : 'var(--color-border)',
                        background: customTestType === 'text' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-card-bg)',
                        color: customTestType === 'text' ? 'var(--color-primary)' : 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare size={14} /> Text Test
                    </button>
                    <button
                      onClick={() => handleSelectCustomTestType('vision')}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: customTestType === 'vision' ? 'var(--color-primary)' : 'var(--color-border)',
                        background: customTestType === 'vision' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-card-bg)',
                        color: customTestType === 'vision' ? 'var(--color-primary)' : 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} /> Vision Test
                    </button>
                    <button
                      onClick={() => handleSelectCustomTestType('image')}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: customTestType === 'image' ? 'var(--color-primary)' : 'var(--color-border)',
                        background: customTestType === 'image' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-card-bg)',
                        color: customTestType === 'image' ? 'var(--color-primary)' : 'var(--color-text-main)',
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
                    {customTestType === 'vision' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--color-bg-soft)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>DEMO IMAGE (FOR VISION ANALYSIS)</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-primary)' }}>Calendar &amp; Landscape Sample</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <img
                            src={customTestImageUrl}
                            alt="Vision Demo"
                            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                          />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input
                              type="text"
                              value={customTestImageUrl}
                              onChange={(e) => setCustomTestImageUrl(e.target.value)}
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
                        {customTestType === 'text' ? 'Test Prompt' : customTestType === 'vision' ? 'Vision Prompt' : 'Image Generation Prompt'}
                      </label>
                      <textarea
                        rows={3}
                        value={customTestPrompt}
                        onChange={(e) => setCustomTestPrompt(e.target.value)}
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
                        onClick={() => handleRunCustomCapabilityTest(prov, customTestType)}
                        disabled={customIsSendingTest || !customTestPrompt.trim() || !drawerTestModelId}
                        style={{
                          padding: '7px 16px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 600,
                          cursor: customIsSendingTest ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {customIsSendingTest ? <RefreshCw size={13} className={styles.spin} /> : <Send size={13} />}
                        {customIsSendingTest ? 'Sending Request...' : 'Send Request'}
                      </button>
                    </div>
                  </div>

                  {/* 4. MODEL RESPONSE BOX */}
                  <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>Response Output</span>
                        {customTestResponse?.latencyMs && (
                          <span style={{ fontSize: '10px', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '1px 6px', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                            {customTestResponse.latencyMs}ms
                          </span>
                        )}
                        {customTestResponse?.status && (
                          <span
                            style={{
                              fontSize: '10px',
                              background: customTestResponse.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: customTestResponse.ok ? '#10b981' : '#ef4444',
                              border: `1px solid ${customTestResponse.ok ? '#10b98133' : '#ef444433'}`,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                          >
                            HTTP {customTestResponse.status}
                          </span>
                        )}
                      </div>

                      {customTestResponse?.text && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(customTestResponse.text || '');
                            setCustomCopiedResponse(true);
                            setTimeout(() => setCustomCopiedResponse(false), 2000);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                        >
                          {customCopiedResponse ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          {customCopiedResponse ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>

                    {/* Response Body */}
                    {customIsSendingTest && (
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                        <RefreshCw size={20} className={styles.spin} />
                        <span style={{ fontSize: '12px' }}>Waiting for model response...</span>
                      </div>
                    )}

                    {!customIsSendingTest && !customTestResponse && (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', border: '1px dashed var(--color-border)', borderRadius: '6px' }}>
                        Click <strong>&quot;Send Request&quot;</strong> above to test {drawerTestModelId || prov.name} and see the model output here.
                      </div>
                    )}

                    {!customIsSendingTest && customTestResponse && (
                      <>
                        {customTestResponse.ok ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* If image generated */}
                            {customTestResponse.imageUrl && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <img
                                  src={customTestResponse.imageUrl}
                                  alt="Generated"
                                  style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--color-border)', maxHeight: '300px', objectFit: 'contain' }}
                                />
                                <a href={customTestResponse.imageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--color-primary)' }}>
                                  Open full size ↗
                                </a>
                              </div>
                            )}

                            {/* Text response */}
                            {customTestResponse.text && (
                              <div style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', color: 'var(--color-text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '250px', overflowY: 'auto' }}>
                                {customTestResponse.text}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '10px 12px', color: '#ef4444', fontSize: '12px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>Request Failed:</div>
                            {customTestResponse.message}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Global Toast Message */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--color-primary)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 10001,
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          {toastMessage}
        </div>
      )}

    </div>
  );
}
