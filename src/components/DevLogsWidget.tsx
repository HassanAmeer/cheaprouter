"use client";

import React, { useEffect, useState } from 'react';
import { Terminal, X, Trash2, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import styles from './DevLogsWidget.module.css';

type LogEntry = {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  component: string;
  message: string;
  details?: any;
};

function LogDetails({ details }: { details: any }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!details) return null;

  return (
    <div>
      <button 
        onClick={() => setExpanded(!expanded)}
        className={styles.detailsBtn}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ marginLeft: '4px' }}>View Payload / Details</span>
      </button>
      {expanded && (
        <pre className={styles.detailsPre}>
          {JSON.stringify(details, null, 2)}
        </pre>
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
          const res = await fetch('/api/admin/dev-logs');
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
      await fetch('/api/admin/dev-logs', { method: 'DELETE' });
      setLogs([]);
    } catch (e) {
      console.error("Failed to clear dev logs");
    }
  };

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
              {logs.length === 0 ? (
                <div className={styles.emptyState}>
                  <Terminal size={32} />
                  <p>No logs yet. Send an API request!</p>
                </div>
              ) : (
                [...logs].reverse().map((log) => (
                  <div key={log.id} className={styles.logEntry}>
                    <div className={styles.logHeader}>
                      <div className={styles.logTypeRow}>
                        <span className={`${styles.badge} ${styles[log.type]}`}>
                          {log.type}
                        </span>
                        <span className={styles.componentName}>{log.component}</span>
                      </div>
                      <span className={styles.timestamp}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={styles.message}>
                      {log.message}
                    </div>
                    <LogDetails details={log.details} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
