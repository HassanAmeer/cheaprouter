'use client';

import React, { useState, useEffect } from 'react';
import { Download, Plus, Save, Trash, FileText } from 'lucide-react';
import styles from '../admin.module.css';

interface RawDataEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function RawDataPage() {
  const [entries, setEntries] = useState<RawDataEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/raw-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const selectEntry = (entry: RawDataEntry) => {
    setActiveId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
  };

  const createNew = () => {
    setActiveId(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }
    setIsSaving(true);
    setError('');
    const token = localStorage.getItem('admin_token');
    try {
      if (activeId) {
        const res = await fetch(`/api/admin/raw-data/${activeId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title || 'Untitled', content })
        });
        if (res.ok) await fetchEntries();
        else setError('Failed to update');
      } else {
        const res = await fetch('/api/admin/raw-data', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title || 'Untitled', content })
        });
        if (res.ok) {
          const resData = await res.json();
          await fetchEntries();
          setActiveId(resData.data.id);
        } else {
          setError('Failed to save new entry');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`/api/admin/raw-data/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activeId === id) createNew();
      await fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'raw-data'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.adminPageContainer}>
      <h1 className={styles.pageTitle}>Raw Data</h1>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
        Store API keys, notes, and raw JSON configurations securely.
      </p>

      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)' }}>
        
        {/* Sidebar */}
        <div style={{ width: '280px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={createNew}
              style={{
                width: '100%', padding: '10px', background: 'var(--color-primary)', color: '#fff',
                border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold'
              }}
            >
              <Plus size={16} /> New Entry
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && <div style={{ padding: '16px', color: '#94a3b8' }}>Loading...</div>}
            {entries.map(entry => (
              <div 
                key={entry.id} 
                onClick={() => selectEntry(entry)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: activeId === entry.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <FileText size={16} color="#94a3b8" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#f8fafc', fontSize: '14px' }}>
                    {entry.title || 'Untitled'}
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g., Auth API Keys)"
              style={{
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                padding: '10px 16px', borderRadius: '6px', fontSize: '16px', flex: 1, marginRight: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleDownload}
                disabled={!content}
                style={{
                  padding: '10px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Download size={16} /> Download
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '10px 24px', background: 'var(--color-primary)', color: '#fff',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                }}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your raw data, API keys, JSON, or notes here..."
            style={{
              flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#a7f3d0',
              padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', resize: 'none', outline: 'none',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
