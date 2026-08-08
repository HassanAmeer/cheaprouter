'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../../admin.module.css';
import { Save, Plus, X, ChevronLeft, RefreshCw, Play, Pause, Globe } from 'lucide-react';
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
type Provider = { id: string; name: string; status: boolean; key: string; priority: number; models: Model[]; baseUrl?: string; useModelsApi?: boolean; modelsApiLink?: string; headers?: Header[]; isCustom?: boolean; apiFormat?: string };

export default function ManageProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());

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
          id: p.id, name: p.name, status: p.status ?? true,
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
    const deepseekPassed = deepseekRef.current ? await deepseekRef.current.testApi(true) : true;
    const fireworksPassed = fireworksRef.current ? await fireworksRef.current.testApi(true) : true;
    const perplexityPassed = perplexityRef.current ? await perplexityRef.current.testApi(true) : true;

    const allPassed = openRouterPassed && openCodePassed && openaiPassed && anthropicPassed && coherePassed &&
      groqPassed && googlePassed && cerebrasPassed && sambanovaPassed && xaiPassed && novitaPassed && bytezPassed && aimlapiPassed &&
      mistralPassed && togetherPassed && deepseekPassed && fireworksPassed && perplexityPassed;
    
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
    setProviders([...providers, { id: providerId, name: newProvName, status: false, key: newProvKey.trim(), priority: providers.length + 1, models: initialModels, baseUrl: newProvBaseUrl.trim() || undefined, apiFormat: newProvApiFormat, useModelsApi: newProvUseModelsApi, modelsApiLink: newProvModelsApiLink.trim() || undefined, headers: newProvHeaders, isCustom: true }]);
    setNewProvId(''); setNewProvName(''); setNewProvBaseUrl(''); setNewProvApiFormat('OpenAI Compatible');
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
    </div>
  );

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
                {newProvModels.length === 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No initial models added.</span>}
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
              {providers.filter(p => !p.isCustom).map(provider => renderProviderTile(provider, false))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
            <div style={{ width: '50%', height: '1px', background: 'var(--color-border)', opacity: 0.6 }} />
          </div>

          {/* ===== PREFIX PROVIDERS ===== */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)' }}>Prefix Providers</h3>
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
    </div>
  );
}
