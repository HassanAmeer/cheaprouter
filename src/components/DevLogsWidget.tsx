"use client";

import React, { useEffect, useState } from 'react';
import { Terminal, X, Trash2, ChevronDown, ChevronRight, Activity, Clock, Server, Copy, Check } from 'lucide-react';
import styles from './DevLogsWidget.module.css';

type LogEntry = {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  component: string;
  message: string;
  details?: any;
  sessionId?: string;
};

type LogSession = {
  sessionId: string;
  startTime: string;
  logs: LogEntry[];
  summary: string;
};

function LogDetailsCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent collapsing the row
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={styles.copyBtn} onClick={handleCopy} title="Copy JSON">
      {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
    </button>
  );
}

function LogEntryRow({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!log.details;

  return (
    <div className={styles.cleanLogEntry}>
      <div 
        className={`${styles.cleanLogLine} ${hasDetails ? styles.clickableLine : ''}`} 
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <div className={styles.cleanLogLineContent}>
          <span className={styles.cleanLogTime}>
            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className={`${styles.cleanBadge} ${styles[log.type]}`}>{log.type}</span>
          <span className={styles.cleanComponent}>[{log.component}]</span>
          <span className={styles.cleanMessage}>{log.message}</span>
        </div>
        {hasDetails && (
          <span className={styles.lineChevron}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </div>
      {expanded && hasDetails && (
        <div className={styles.detailsContainer} onClick={(e) => e.stopPropagation()}>
          <LogDetailsCopyButton text={JSON.stringify(log.details, null, 2)} />
          <pre className={styles.detailsPre}>
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function SessionAccordion({ session }: { session: LogSession }) {
  const [isOpen, setIsOpen] = useState(false);
  const isError = session.logs.some(l => l.type === 'ERROR' || l.type === 'WARNING');
  const isSuccess = session.logs.some(l => l.type === 'SUCCESS');

  return (
    <div className={`${styles.sessionCard} ${isOpen ? styles.sessionOpen : ''}`}>
      <div className={styles.sessionHeader} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.sessionHeaderLeft}>
          <div className={`${styles.sessionIndicator} ${isError ? styles.indicatorError : isSuccess ? styles.indicatorSuccess : ''}`}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          <div>
            <div className={styles.sessionTitle}>{session.summary || 'General Logs'}</div>
            <div className={styles.sessionTime}>
              <Clock size={11} /> {new Date(session.startTime).toLocaleTimeString()} 
              <span className={styles.logCountDot}>•</span> 
              {session.logs.length} logs
            </div>
          </div>
        </div>
        {session.sessionId !== 'general' && (
          <div className={styles.sessionIdBadge} title="Session ID">
            <Server size={11} /> {session.sessionId.slice(0, 6)}
          </div>
        )}
      </div>

      {isOpen && (
        <div className={styles.sessionBody}>
          {session.logs.map((log) => (
            <LogEntryRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DevLogsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen) {
      const fetchLogs = async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const res = await fetch('/api/admin/dev-logs', {
            headers: { 'Authorization': `Bearer ${token || ''}` }
          });
          if (res.ok) {
            const data = await res.json();
            setLogs(data);
          }
        } catch (e) {
          console.error("Failed to fetch dev logs");
        }
      };
      
      fetchLogs();
      interval = setInterval(fetchLogs, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  const clearLogs = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/admin/dev-logs', { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
      setLogs([]);
    } catch (e) {
      console.error("Failed to clear dev logs");
    }
  };

  // Group logs into sessions
  const sessions: LogSession[] = [];
  const sessionMap = new Map<string, LogSession>();

  logs.forEach(log => {
    const sId = log.sessionId || 'general';
    if (!sessionMap.has(sId)) {
      const newSession: LogSession = {
        sessionId: sId,
        startTime: log.timestamp,
        logs: [],
        summary: sId === 'general' ? 'System Logs' : log.message
      };
      sessionMap.set(sId, newSession);
      sessions.push(newSession);
    }
    
    const session = sessionMap.get(sId)!;
    session.logs.push(log);
    
    // Update summary if this log has a better title (like the initial UI request)
    if (log.component === 'Frontend UI' && log.message.includes('Sending chat request')) {
      session.summary = log.message;
    }
  });

  // Reverse so newest sessions are at the top
  const displaySessions = [...sessions].reverse();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={styles.triggerBtn}
        title="Open Dev Logs"
      >
        <Terminal size={16} />
        <span>Dev Logs</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <div className={styles.title}>
                <Activity size={18} className={styles.titleIcon} />
                Live Dev Logs
              </div>
              <div className={styles.actions}>
                <button 
                  onClick={clearLogs}
                  className={`${styles.iconBtn} ${styles.danger}`}
                  title="Clear Logs"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className={styles.iconBtn}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.logsContainer}>
              {displaySessions.length === 0 ? (
                <div className={styles.emptyState}>
                  <Terminal size={32} />
                  <p>No logs yet. Send an API request!</p>
                </div>
              ) : (
                displaySessions.map((session) => (
                  <SessionAccordion key={session.sessionId} session={session} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

