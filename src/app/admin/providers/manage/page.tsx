'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../../admin.module.css';
import { Save, Plus, X, ChevronLeft, RefreshCw, Play, Pause, Globe, Info, ExternalLink, Copy, Upload, History, Check, Download, Edit, Search, Trash2 } from 'lucide-react';
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


type Model = { id: string; name: string; originalId?: string; text?: boolean; reasoning?: boolean; vision?: boolean; image?: boolean; video?: boolean; embedding?: boolean; audio?: boolean; contextWindow?: string; tokenLimit?: string; access?: string; inputPrice?: string; outputPrice?: string; showOnLandingPage?: boolean; };
type Header = { id: string; key: string; value: string };
type Provider = { id: string; name: string; status: boolean; key: string; priority: number; models: Model[]; baseUrl?: string; useModelsApi?: boolean; modelsApiLink?: string; headers?: Header[]; isCustom?: boolean; apiFormat?: string; icon?: string };

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

  const monacoEditorRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleVersion = async (v: 1 | 2) => {
    setDisplayVersion(v);
    if (v === 2 && !backupData) {
      try {
        const res = await fetch('/api/admin/providers/get-backup');
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
              : { id: m.id || m.originalId || '', name: m.name || m.originalName || m.id || '', originalId: m.originalId || m.id || '', reasoning: m.reasoning ?? m.text ?? false, image: m.image || m.vision || false, tokenLimit: m.tokenLimit || 'Unlimited', access: m.access || 'Free' })
            : []
        }));
      }

      const openRouterRes = await fetch('/api/admin/openrouter', { headers });
      if (openRouterRes.ok) {
        const openRouterData = await openRouterRes.json();
        if (openRouterData && Array.isArray(openRouterData.models)) {
          const openRouterModels = openRouterData.models.map((m: any) => typeof m === 'string'
            ? { id: m, name: m, originalId: m, reasoning: true, image: false, tokenLimit: 'Unlimited', access: 'Free' }
            : { id: m.id || m.originalId || '', name: m.name || m.originalName || m.id || '', originalId: m.originalId || m.id || '', reasoning: m.text ?? m.reasoning ?? true, image: m.image || m.vision || false, tokenLimit: m.tokenLimit || 'Unlimited', access: m.access || 'Free' });
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

  const handleAddProvider = () => {
    if (!newProvName.trim()) return;
    let initialModels: Model[] = [];
    if (!newProvUseModelsApi) {
      initialModels = newProvModels.filter(m => m.name.trim() && m.id.trim()).map(m => ({ ...m, id: m.id.trim(), name: m.name.trim(), originalId: m.originalId?.trim() || m.id.trim() }));
    }
    const providerId = newProvId.trim() ? newProvId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') : `prov_${Date.now()}`;
    setProviders([...providers, { id: providerId, name: newProvName, icon: newProvIcon.trim() || undefined, status: false, key: newProvKey.trim(), priority: providers.length + 1, models: initialModels, baseUrl: newProvBaseUrl.trim() || undefined, apiFormat: newProvApiFormat, useModelsApi: newProvUseModelsApi, modelsApiLink: newProvModelsApiLink.trim() || undefined, headers: newProvHeaders, isCustom: true }]);
    setNewProvId(''); setNewProvName(''); setNewProvIcon(''); setNewProvBaseUrl(''); setNewProvApiFormat('OpenAI Compatible');
    setNewProvKey(''); setNewProvHeaders([]); setNewProvUseModelsApi(false); setNewProvModelsApiLink(''); setNewProvModels([]);
    setShowAddProvider(false); setSaved(false);
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

  const renderProviderTile = (provider: Provider, isCustomGroup: boolean) => (
    <div key={provider.id} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer', background: expandedProviders.has(provider.id) ? 'var(--color-bg-soft)' : 'transparent' }}
        onClick={() => toggleExpanded(provider.id)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {getDomainFromUrl(provider.baseUrl) ? (
              <img src={`https://www.google.com/s2/favicons?domain=${getDomainFromUrl(provider.baseUrl)}&sz=128`} alt={provider.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            ) : (
              <Globe size={18} color="var(--color-primary)" />
            )}
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{provider.name}</span>
          {isCustomGroup && <span style={{ fontSize: '11px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Custom</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
          <label className={styles.toggleSwitch}>
            <input type="checkbox" checked={provider.status} onChange={() => toggleProvider(provider.id)} />
            <span className={styles.toggleSlider}></span>
          </label>
          {isCustomGroup && (
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this custom provider?')) { setProviders(providers.filter(p => p.id !== provider.id)); setSaved(false); } }}
              style={{ background: 'var(--color-primary-soft)', color: 'var(--color-danger)', border: 'none', padding: '6px', borderRadius: '6px', display: 'flex', cursor: 'pointer', transition: 'all 0.2s' }}
              title="Delete Custom Provider"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {expandedProviders.has(provider.id) && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parseKeys(provider.key).map((kObj, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: kObj.active ? 1 : 0.6 }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Key {idx + 1} {kObj.active ? '' : '(Paused)'}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="password" value={kObj.key} onChange={(e) => updateKeyIndex(provider.id, idx, e.target.value)}
                    placeholder={`Enter ${provider.name} API Key`} disabled={!provider.status || !kObj.active} autoComplete="new-password"
                    style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontFamily: 'monospace', fontSize: '13px' }} />
                  <button onClick={() => toggleKeyActive(provider.id, idx)} disabled={!provider.status} className="btn-secondary" style={{ padding: '10px 12px', display: 'flex', color: kObj.active ? '#eab308' : '#10b981', height: '40px' }} title={kObj.active ? "Pause Key" : "Resume Key"}>
                    {kObj.active ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  {idx > 0 && (
                    <button onClick={() => removeKey(provider.id, idx)} disabled={!provider.status} className="btn-secondary" style={{ padding: '10px 12px', display: 'flex', color: '#ef4444', height: '40px' }} title="Remove Key">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={() => addKey(provider.id)} disabled={!provider.status} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '4px' }}>
              <Plus size={14} /> Add Another API Key
            </button>
          </div>

          {isCustomGroup && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider API Format</label>
                <select value={provider.apiFormat || 'OpenAI Compatible'} onChange={(e) => updateApiFormat(provider.id, e.target.value)} disabled={!provider.status}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px', appearance: 'auto' }}>
                  <option value="OpenAI Compatible">OpenAI Compatible</option>
                  <option value="OpenAI Responses">OpenAI Responses</option>
                  <option value="Anthropic Messages">Anthropic Messages</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>API Base URL</label>
                <input type="text" value={provider.baseUrl || ''} onChange={(e) => updateBaseUrl(provider.id, e.target.value)}
                  placeholder="e.g. https://api.openai.com/v1" disabled={!provider.status}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }} />
              </div>

              {/* Provider Icon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Provider Icon URL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={provider.icon || ''} onChange={(e) => { setProviders(providers.map(p => p.id === provider.id ? { ...p, icon: e.target.value } : p)); setSaved(false); }}
                    placeholder="e.g. https://cdn.simpleicons.org/openai/10A37F" disabled={!provider.status}
                    style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }} />
                  <select value={provider.icon || ''} onChange={(e) => { setProviders(providers.map(p => p.id === provider.id ? { ...p, icon: e.target.value } : p)); setSaved(false); }} disabled={!provider.status}
                    style={{ width: '130px', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }}>
                    <option value="">Custom...</option>
                    <option value="https://cdn.simpleicons.org/openai/10A37F">OpenAI</option>
                    <option value="https://cdn.simpleicons.org/anthropic/D97757">Anthropic</option>
                    <option value="https://cdn.simpleicons.org/google/4285F4">Google</option>
                    <option value="https://cdn.simpleicons.org/meta/0668E1">Meta</option>
                    <option value="https://cdn.simpleicons.org/x/000000">X.AI</option>
                    <option value="https://cdn.simpleicons.org/deepseek/4D8B3D">DeepSeek</option>
                  </select>
                </div>
              </div>

              {/* Headers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Headers (Optional)</label>
                  <button onClick={() => handleAddHeader(provider.id)} disabled={!provider.status}
                    style={{ background: 'none', border: 'none', color: provider.status ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Add Header
                  </button>
                </div>
                {provider.headers?.map(header => (
                  <div key={header.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" value={header.key} onChange={(e) => handleUpdateHeader(provider.id, header.id, 'key', e.target.value)}
                      placeholder="Header Name (e.g. Authorization)" disabled={!provider.status}
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '12px' }} />
                    <input type="text" value={header.value} onChange={(e) => handleUpdateHeader(provider.id, header.id, 'value', e.target.value)}
                      placeholder="Value (e.g. Bearer sk-...)" disabled={!provider.status}
                      style={{ flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '6px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '12px' }} />
                    <button onClick={() => handleRemoveHeader(provider.id, header.id)} disabled={!provider.status}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', padding: '4px' }}>
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
                  <input type="checkbox" checked={provider.useModelsApi || false}
                    onChange={() => { setProviders(providers.map(p => p.id === provider.id ? { ...p, useModelsApi: !(p.useModelsApi || false) } : p)); setSaved(false); }} />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>

            {provider.useModelsApi ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Models List API Link</label>
                <input type="text" value={provider.modelsApiLink || ''}
                  onChange={(e) => { setProviders(providers.map(p => p.id === provider.id ? { ...p, modelsApiLink: e.target.value } : p)); setSaved(false); }}
                  placeholder="e.g. https://api.openai.com/v1/models" disabled={!provider.status}
                  style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px', color: 'var(--color-text-main)', opacity: provider.status ? 1 : 0.5, outline: 'none', fontSize: '13px' }} />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 600 }}>Active Models</span>
                  <button onClick={() => setAddingModelTo(provider.id)} disabled={!provider.status}
                    style={{ background: 'none', border: 'none', color: provider.status ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600, cursor: provider.status ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plus size={14} /> Add Model
                  </button>
                </div>

                {addingModelTo === provider.id && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', padding: '12px', background: 'var(--color-bg-soft)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Original Model ID</label>
                        <input type="text" value={newModelOriginalId} onChange={(e) => setNewModelOriginalId(e.target.value)} placeholder="e.g. gpt-4" autoFocus
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model Name</label>
                        <input type="text" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="e.g. GPT-4"
                          style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Showing Model ID</label>
                      <input type="text" value={newModelShowingId} onChange={(e) => setNewModelShowingId(e.target.value)} placeholder="e.g. cr-gpt-4"
                        style={{ background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: '6px', color: 'var(--color-text-main)', outline: 'none', fontSize: '12px' }} />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>* Users calling our API will use this ID, but will see the "Showing Model Name" in the UI.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newModelReasoning} onChange={(e) => setNewModelReasoning(e.target.checked)} /> Reasoning
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newModelImage} onChange={(e) => setNewModelImage(e.target.checked)} /> Image
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

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100000, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', animation: 'fadeInUp 0.3s ease' }}>
          <Check size={16} />
          {toastMessage}
        </div>
      )}
    </div>
  );
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
      const res = await fetch('/api/admin/providers/get-backup');
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
        headers: { 'Content-Type': 'application/json' },
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
              <OpenRouterSetup ref={openRouterRef} index={1} onModelsUpdated={() => fetchProviders(true)} />
              <OpenCodeSetup ref={openCodeRef} index={2} onModelsUpdated={() => fetchProviders(true)} />
              <OpenAISetup ref={openaiRef} index={3} onModelsUpdated={() => fetchProviders(true)} />
              <AnthropicSetup ref={anthropicRef} index={4} onModelsUpdated={() => fetchProviders(true)} />
              <CohereSetup ref={cohereRef} index={5} onModelsUpdated={() => fetchProviders(true)} />
              <GroqSetup ref={groqRef} index={6} onModelsUpdated={() => fetchProviders(true)} />
              <GoogleSetup ref={googleRef} index={7} onModelsUpdated={() => fetchProviders(true)} />
              <CerebrasSetup ref={cerebrasRef} index={8} onModelsUpdated={() => fetchProviders(true)} />
              <SambaNovaSetup ref={sambanovaRef} index={9} onModelsUpdated={() => fetchProviders(true)} />
              <XAISetup ref={xaiRef} index={10} onModelsUpdated={() => fetchProviders(true)} />
              <NovitaSetup ref={novitaRef} index={11} onModelsUpdated={() => fetchProviders(true)} />
              <BytezSetup ref={bytezRef} index={12} onModelsUpdated={() => fetchProviders(true)} />
              <AIMLAPISetup ref={aimlapiRef} index={13} onModelsUpdated={() => fetchProviders(true)} />
              <TokenHarborSetup ref={tokenharborRef} index={14} onModelsUpdated={() => fetchProviders(true)} />
              <AIANDSetup ref={aiandRef} index={15} onModelsUpdated={() => fetchProviders(true)} />
              <MistralSetup ref={mistralRef} index={14} onModelsUpdated={() => fetchProviders(true)} />
              <TogetherSetup ref={togetherRef} index={15} onModelsUpdated={() => fetchProviders(true)} />
              <DeepSeekSetup ref={deepseekRef} index={16} onModelsUpdated={() => fetchProviders(true)} />
              <FireworksSetup ref={fireworksRef} index={17} onModelsUpdated={() => fetchProviders(true)} />
              <PerplexitySetup ref={perplexityRef} index={18} onModelsUpdated={() => fetchProviders(true)} />
              <AmazonBedrockSetup ref={amazonbedrockRef} index={19} onModelsUpdated={() => fetchProviders(true)} />
              <GithubSetup ref={githubRef} index={20} onModelsUpdated={() => fetchProviders(true)} />
              <HuggingFaceSetup ref={huggingfaceRef} index={21} onModelsUpdated={() => fetchProviders(true)} />
              <HyperbolicSetup ref={hyperbolicRef} index={22} onModelsUpdated={() => fetchProviders(true)} />
              <MoonshotSetup ref={moonshotRef} index={23} onModelsUpdated={() => fetchProviders(true)} />
              <ZaiSetup ref={zaiRef} index={24} onModelsUpdated={() => fetchProviders(true)} />
              <NvidiaSetup ref={nvidiaRef} index={25} onModelsUpdated={() => fetchProviders(true)} />
              <KiloCodeSetup ref={kilocodeRef} index={26} onModelsUpdated={() => fetchProviders(true)} />
              <ClineCodeSetup ref={clinecodeRef} index={27} onModelsUpdated={() => fetchProviders(true)} />
              <PoixeSetup ref={poixeRef} index={28} onModelsUpdated={() => fetchProviders(true)} />
              <SiliconFlowSetup ref={siliconflowRef} index={29} onModelsUpdated={() => fetchProviders(true)} />
              <ZenmuxSetup ref={zenmuxRef} index={30} onModelsUpdated={() => fetchProviders(true)} />
              <UnoRouterSetup ref={unorouterRef} index={31} onModelsUpdated={() => fetchProviders(true)} />
              <RoutewaySetup ref={routewayRef} index={32} onModelsUpdated={() => fetchProviders(true)} />
              <StepFunSetup ref={stepfunRef} index={33} onModelsUpdated={() => fetchProviders(true)} />
              <LLM7Setup ref={llm7Ref} index={34} onModelsUpdated={() => fetchProviders(true)} />
              <ModelScopeSetup ref={modelscopeRef} index={35} onModelsUpdated={() => fetchProviders(true)} />
              <AIHordeSetup ref={aihordeRef} index={36} onModelsUpdated={() => fetchProviders(true)} />
              <PollinationsSetup ref={pollinationsRef} index={37} onModelsUpdated={() => fetchProviders(true)} />
              <AnyRouterSetup ref={anyrouterRef} index={38} onModelsUpdated={() => fetchProviders(true)} />
              <AgnesAISetup ref={agnesaiRef} index={39} onModelsUpdated={() => fetchProviders(true)} />
              <TokenRouterSetup ref={tokenrouterRef} index={40} onModelsUpdated={() => fetchProviders(true)} />

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

    </div>
  );
}
