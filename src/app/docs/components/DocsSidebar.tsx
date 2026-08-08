import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Box, MessageSquare, Activity, ChevronRight } from 'lucide-react';

export type ViewType = 'introduction' | 'models' | 'chat-completions' | 'limits';

interface DocsSidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const navItems = [
  { id: 'introduction', label: 'Introduction', icon: BookOpen },
  { id: 'models', label: 'List of Models', icon: Box },
  { id: 'chat-completions', label: 'Usage of Models', icon: MessageSquare },
  { id: 'limits', label: 'Limit of Account', icon: Activity },
];

export default function DocsSidebar({ activeView, setActiveView }: DocsSidebarProps) {
  return (
    <aside style={{ 
      width: '260px', 
      flexShrink: 0, 
      position: 'sticky', 
      top: '40px', 
      height: 'max-content',
      backgroundColor: 'var(--color-card-bg)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <h3 style={{ 
        fontSize: '13px', 
        textTransform: 'uppercase', 
        color: 'var(--color-text-muted)', 
        letterSpacing: '1.2px', 
        marginBottom: '20px',
        fontWeight: 700
      }}>
        API Documentation
      </h3>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="sidebar-active" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
