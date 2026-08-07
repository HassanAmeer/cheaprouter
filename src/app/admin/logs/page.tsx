'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Database, Server, Settings, RefreshCw, Terminal, ChevronDown, ChevronRight, Activity, Download } from 'lucide-react';
import styles from '../admin.module.css';

export default function SystemLogsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [deleteRange, setDeleteRange] = useState('1');
  const [isDeleting, setIsDeleting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const fetchSystemData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/system', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch system logs');
      const json = await res.json();
      setData(json);
      
      // Auto-scroll terminal to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogs = async () => {
    if (!confirm(`Are you sure you want to delete logs for the selected timeframe?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/system', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days: deleteRange === 'all' ? 'all' : Number(deleteRange) })
      });
      if (!res.ok) throw new Error('Failed to delete logs');
      await fetchSystemData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadLogs = (logsToDownload: string[], filename: string) => {
    if (!logsToDownload || logsToDownload.length === 0) {
      alert('No logs to download');
      return;
    }
    const blob = new Blob([logsToDownload.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>System Logs & Health</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Monitor database connection, server status, and real-time backend logs.</p>
        </div>
        <button 
          onClick={fetchSystemData} 
          disabled={loading}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          <RefreshCw size={16} className={loading ? styles.spin : ''} /> 
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {/* COLLAPSIBLE SYSTEM INFO */}
      <div className="card glass-card" style={{ marginBottom: '24px', overflow: 'hidden', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
        <div 
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(150,150,150,0.05)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>System Information & Configuration</h3>
          </div>
          <div style={{ color: 'var(--color-text-muted)' }}>
            {isInfoExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
        
        {isInfoExpanded && data && (
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', borderTop: '1px solid var(--color-border)' }}>
            
            {/* Database Status & Stats */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-text-main)', fontWeight: 600 }}>
                <Database size={16} /> PostgreSQL Database
              </div>
              <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: data.dbConnected ? '#10B981' : '#EF4444', boxShadow: `0 0 8px ${data.dbConnected ? '#10B981' : '#EF4444'}` }} />
                  <span style={{ fontWeight: 600, color: data.dbConnected ? '#10B981' : '#EF4444' }}>{data.dbConnected ? 'Connected' : 'Connection Failed'}</span>
                </div>
                {data.postgresInfo && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Database Name:</span>
                      <span style={{ fontWeight: 500, color: '#60A5FA' }}>{data.postgresInfo.dbName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Host & Port:</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.dbHost}:{data.postgresInfo.dbPort}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Username / Password:</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.dbUser} / {data.postgresInfo.dbPassword}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Connection URL:</span>
                      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#94a3b8', fontSize: '11px' }}>{data.postgresInfo.rawUrl}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Version:</span>
                      <span style={{ fontWeight: 500, maxWidth: '140px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={data.postgresInfo.version}>{data.postgresInfo.version}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Uptime (Since):</span>
                      <span style={{ fontWeight: 500, maxWidth: '140px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {data.postgresInfo.uptime ? new Date(data.postgresInfo.uptime).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Database Size:</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.databaseSize}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Tables & Rows:</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.tableCount} Tables / ~{data.postgresInfo.approximateRows} Rows</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Connections (Active/Max):</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.activeConnections} / {data.postgresInfo.maxConnections}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Memory (Shared / Work):</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.sharedBuffers} / {data.postgresInfo.workMem}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Encoding & Collation:</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.encoding} / {data.postgresInfo.collation}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Timezone:</span>
                      <span style={{ fontWeight: 500 }}>{data.postgresInfo.timezone}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Data Directory:</span>
                      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#94a3b8' }}>{data.postgresInfo.dataDirectory}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Server Specs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-text-main)', fontWeight: 600 }}>
                <Server size={16} /> Hardware & OS
              </div>
              <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Hostname:</span>
                  <span style={{ fontWeight: 500, maxWidth: '140px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={data.hardwareInfo?.hostname}>{data.hardwareInfo?.hostname}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>OS Platform:</span>
                  <span style={{ fontWeight: 500, maxWidth: '140px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={data.hardwareInfo?.osPlatform}>{data.hardwareInfo?.osPlatform}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Architecture & Endian:</span>
                  <span style={{ fontWeight: 500 }}>{data.hardwareInfo?.arch} ({data.hardwareInfo?.endianness})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>CPU Processor:</span>
                  <span style={{ fontWeight: 500, color: '#fcd34d' }}>{data.hardwareInfo?.cpuModel} ({data.hardwareInfo?.cpuSpeed} MHz)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>CPU Cores:</span>
                  <span style={{ fontWeight: 500 }}>{data.hardwareInfo?.cpuCores} Cores</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>System Load (1, 5, 15m):</span>
                  <span style={{ fontWeight: 500 }}>{data.hardwareInfo?.loadAverage?.join(', ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>System RAM:</span>
                  <span style={{ fontWeight: 500 }}>{data.hardwareInfo?.freeMemMB}MB Free / {data.hardwareInfo?.totalMemMB}MB Total</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Machine Uptime:</span>
                  <span style={{ fontWeight: 500 }}>{Math.floor((data.hardwareInfo?.uptimeSeconds || 0) / 3600)}h {Math.floor(((data.hardwareInfo?.uptimeSeconds || 0) % 3600) / 60)}m</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Network IPs (IPv4):</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: '#60A5FA', fontFamily: 'monospace' }}>
                    {data.hardwareInfo?.networkIPs?.map((ip: string, i: number) => (
                      <span key={i}>{ip}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Temp Directory:</span>
                  <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{data.hardwareInfo?.tmpDir}</span>
                </div>
              </div>
            </div>

            {/* Bun Runtime & Config */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-text-main)', fontWeight: 600 }}>
                <Activity size={16} /> Runtime & Config
              </div>
              <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Bun Version:</span>
                  <span style={{ fontWeight: 500, color: '#f87171' }}>v{data.bunInfo?.version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Node Compatibility:</span>
                  <span style={{ fontWeight: 500 }}>v{data.bunInfo?.nodeVersion}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Process User:</span>
                  <span style={{ fontWeight: 500 }}>{data.bunInfo?.runUser}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Process PID:</span>
                  <span style={{ fontWeight: 500 }}>{data.bunInfo?.pid}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>API Uptime:</span>
                  <span style={{ fontWeight: 500 }}>{Math.floor((data.bunInfo?.uptimeSeconds || 0) / 3600)}h {Math.floor(((data.bunInfo?.uptimeSeconds || 0) % 3600) / 60)}m</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Memory (RSS / Heap Used / Total):</span>
                  <span style={{ fontWeight: 500, color: '#f472b6' }}>{data.bunInfo?.memoryUsageMB} / {data.bunInfo?.heapUsedMB} / {data.bunInfo?.heapTotalMB} MB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>CPU Process (User / System):</span>
                  <span style={{ fontWeight: 500 }}>{data.bunInfo?.cpuUsageUser}ms / {data.bunInfo?.cpuUsageSystem}ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Frontend Server:</span>
                  <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: '#60A5FA', textDecoration: 'underline' }}>http://localhost:3000 (Port 3000)</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Backend Server:</span>
                  <a href={`http://localhost:${data.config?.PORT || 4000}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: '#60A5FA', textDecoration: 'underline' }}>http://localhost:{data.config?.PORT || 4000} (Port {data.config?.PORT || 4000})</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>NODE_ENV:</span>
                  <span style={{ fontWeight: 500, color: '#10B981' }}>{data.config?.NODE_ENV}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Executable & Shell:</span>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#94a3b8' }}>Exe: {data.bunInfo?.execPath}</span>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#94a3b8' }}>Shell: {data.bunInfo?.userShell}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Working Dir & Home:</span>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#94a3b8' }}>Dir: {data.config?.CWD}</span>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#94a3b8' }}>Home: {data.bunInfo?.userHome}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>CLI Arguments:</span>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#94a3b8', fontSize: '11px' }}>{data.bunInfo?.cliArgs}</span>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* TERMINAL LOGS */}
      <div className="card glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Terminal size={16} color="#bbb" />
          <span style={{ color: '#bbb', fontSize: '14px', fontWeight: 500, fontFamily: 'monospace' }}>backend_server.log (Last 200 lines)</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <select 
              value={deleteRange}
              onChange={(e) => setDeleteRange(e.target.value)}
              style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', outline: 'none' }}
              disabled={isDeleting}
            >
              <option value="1">Last 1 Day</option>
              <option value="7">Last 7 Days</option>
              <option value="15">Last 15 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="all">All Logs</option>
            </select>
            <button 
              onClick={handleDeleteLogs}
              disabled={isDeleting}
              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1 }}
            >
              {isDeleting ? 'Deleting...' : 'Clear All'}
            </button>
            <button 
              onClick={() => handleDownloadLogs(data?.logs || [], `backend_logs_${new Date().toISOString().split('T')[0]}.txt`)}
              style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
        <div 
          ref={terminalRef}
          style={{ 
            background: '#0d1117', 
            padding: '16px', 
            height: '500px', 
            overflowY: 'auto',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: '13px',
            color: '#c9d1d9',
            lineHeight: 1.5
          }}
        >
          {!data && loading && (
            <div style={{ color: '#8b949e' }}>Connecting to log stream...</div>
          )}
          {data?.logs && data.logs.length === 0 && (
            <div style={{ color: '#8b949e' }}>No backend logs available yet.</div>
          )}
          {data?.logs && [...data.logs].reverse().map((log: string, idx: number) => {
            const isError = log.includes('[ERROR]');
            const isInfo = log.includes('[INFO]');
            return (
              <div key={idx} style={{ 
                marginBottom: '4px',
                color: isError ? '#ff7b72' : isInfo ? '#79c0ff' : '#c9d1d9',
                wordBreak: 'break-all'
              }}>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
