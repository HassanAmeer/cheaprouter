import React from 'react';

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
        { id: 'introduction', label: 'API Reference', badge: 'GET', badgeColor: '#4ade80' }, // Green
        { id: 'models', label: 'List of Models', badge: 'GET', badgeColor: '#4ade80' },
        { id: 'chat-completions', label: 'Chat Completions', badge: 'POST', badgeColor: 'var(--color-primary)' }, // Red
      ]
    },
    {
      groupTitle: 'ACCOUNT SETTINGS',
      items: [
        { id: 'limits', label: 'Limit of Account', badge: 'GET', badgeColor: '#4ade80' },
      ]
    }
  ];

  return (
    <aside style={{ 
      width: '260px', 
      flexShrink: 0, 
      position: 'sticky', 
      top: '40px', 
      height: 'max-content',
      padding: '24px 0',
    }}>
      
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ backgroundColor: 'rgba(204, 0, 0, 0.1)', color: 'var(--color-primary)', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>API</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Reference</span>
        </div>
        <div style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>CheapAgents REST endpoints</div>
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
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
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
                      color: isActive ? '#fff' : '#999', 
                      fontSize: '13px', 
                      fontWeight: isActive ? 600 : 500 
                    }}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
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
