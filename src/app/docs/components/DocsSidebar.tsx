import React from 'react';
import { Terminal, Book, Code, Activity } from 'lucide-react';

export type ViewType = 'introduction' | 'models' | 'chat-completions' | 'limits';

interface DocsSidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export default function DocsSidebar({ activeView, setActiveView }: DocsSidebarProps) {
  
  const navGroups = [
    {
      groupTitle: 'CORE API',
      items: [
        { id: 'introduction', label: 'API Reference', badge: 'GET', badgeColor: '#ccff00' },
        { id: 'models', label: 'List of Models', badge: 'GET', badgeColor: '#ccff00' },
        { id: 'chat-completions', label: 'Chat Completions', badge: 'POST', badgeColor: '#a855f7' },
      ]
    },
    {
      groupTitle: 'ACCOUNT SETTINGS',
      items: [
        { id: 'limits', label: 'Limit of Account', badge: 'GET', badgeColor: '#ccff00' },
      ]
    }
  ];

  return (
    <aside style={{ 
      width: '280px', 
      flexShrink: 0, 
      backgroundColor: '#0a0a0a',
      borderRight: '1px solid #1f1f1f',
      padding: '24px 16px',
      height: 'calc(100vh - 65px)',
      overflowY: 'auto'
    }}>
      
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ backgroundColor: '#ccff00', color: '#000', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>API</span>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>Reference</span>
        </div>
        <div style={{ color: '#666', fontSize: '12px' }}>CheapAgents REST endpoints</div>
      </div>

      {navGroups.map((group, gIdx) => (
        <div key={gIdx} style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: '#666', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            marginBottom: '12px',
            paddingLeft: '8px'
          }}>
            {group.groupTitle}
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {group.items.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ViewType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? '#1a1a1a' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#111';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      color: item.badgeColor, 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      width: '32px',
                      textAlign: 'center'
                    }}>
                      {item.badge}
                    </span>
                    <span style={{ 
                      color: isActive ? '#fff' : '#888', 
                      fontSize: '13px', 
                      fontWeight: isActive ? 600 : 500 
                    }}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#ccff00', borderRadius: '50%' }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
