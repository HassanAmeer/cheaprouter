type LogEntry = {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  component: string;
  message: string;
  details?: any;
  sessionId?: string;
};

const logs: LogEntry[] = [];

export function addDevLog(type: LogEntry['type'], component: string, message: string, details?: any, sessionId?: string) {
  logs.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type,
    component,
    message,
    details,
    sessionId
  });
  
  if (logs.length > 300) {
    logs.shift(); // Keep only the last 300 logs
  }
}

export function getDevLogs() {
  return logs;
}

export function clearDevLogs() {
  logs.length = 0;
}
