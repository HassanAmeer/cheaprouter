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
        { id: 'introduction', label: 'Introduction', badge: 'INFO', badgeColor: '#3b82f6' },
        { id: 'models', label: 'List of Models', badge: 'GET', badgeColor: 'var(--color-success)' },
        { id: 'chat-completions', label: 'Chat Completions', badge: 'POST', badgeColor: 'var(--color-primary)' },
      ]
    },
    {
      groupTitle: 'ACCOUNT SETTINGS',
      items: [
        { id: 'limits', label: 'Account Info', badge: 'GET', badgeColor: 'var(--color-success)' },
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
      padding: '0 16px 24px 0',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 'calc(100vh - 140px)'
    }}>
      
      <div>
        <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ backgroundColor: 'var(--color-success)', color: '#000', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>API</span>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>Reference</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>CheapAgents REST endpoints</div>
        </div>

        {navGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
              paddingLeft: '12px'
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
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Badge */}
                      <span style={{
                        backgroundColor: isActive ? item.badgeColor : 'rgba(0,0,0,0.2)',
                        color: isActive ? '#fff' : item.badgeColor,
                        border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        minWidth: '36px',
                        textAlign: 'center',
                        textShadow: isActive ? 'none' : 'none'
                      }}>
                        {item.badge}
                      </span>
                      {/* Label */}
                      <span style={{
                        color: isActive ? '#f8fafc' : '#94a3b8',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500
                      }}>
                        {item.label}
                      </span>
                    </div>
                    {/* Active Dot */}
                    {isActive && (
                      <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-primary)' }} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Status Section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '12px 16px', 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 'var(--radius-lg)',
        marginTop: '24px'
      }}>
        <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-primary)' }} />
        <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>API Server</span>
        <code style={{ color: 'var(--color-primary)', fontSize: '11px', fontWeight: 700 }}>cheapapi.com</code>
      </div>
    </aside>
  );
}
