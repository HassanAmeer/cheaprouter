import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, MessageSquare, Globe, Code2, Puzzle, Network, Terminal } from 'lucide-react';

export default function IntroductionView() {
  const features = [
    { icon: <Cpu size={20} className="text-primary" />, title: 'Multiple Models', desc: 'Access a wide variety of state-of-the-art AI models for any use case.' },
    { icon: <MessageSquare size={20} className="text-primary" />, title: 'Chat Capabilities', desc: 'Build engaging conversational agents and chatbots effortlessly.' },
    { icon: <Globe size={20} className="text-primary" />, title: 'Website Builder', desc: 'Generate and deploy complete websites with AI assistance.' },
    { icon: <Code2 size={20} className="text-primary" />, title: 'Robust APIs', desc: 'Integrate directly into your applications with our RESTful endpoints.' },
    { icon: <Puzzle size={20} className="text-primary" />, title: 'Browser Extensions', desc: 'Enhance your daily workflow with our official browser extensions.' },
    { icon: <Terminal size={20} className="text-primary" />, title: 'Cheap CLI Code Editor', desc: 'Edit and write code directly from your terminal using AI assistance.' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '24px' }}>
          <span>API</span>
          <span>&gt;</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Introduction</span>
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px', color: 'var(--color-text-main)' }}>
          Welcome to CheapRouter
        </h2>
        
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '800px', lineHeight: '1.6', marginBottom: '24px' }}>
          The ultimate platform for AI-powered development. Our API is organized around REST and is 100% compatible with the OpenAI specification. Use official SDKs by simply changing the Base URL and API Key to point to our endpoints.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '48px', alignItems: 'flex-start' }}>
        
        {/* Left Column: API Basics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Network size={20} color="#f8fafc" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>API Basics</h3>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Base URL & Endpoints</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              All API requests must be prefixed with our Base URL. Endpoints represent the specific actions you can perform, such as listing models (<code>/v1/models</code>) or generating chat completions.
            </p>
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              color: 'var(--color-text-main)',
              fontSize: '13px',
            }}>
              https://api.cheaprouter.com/v1
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Authentication</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              Authenticate your API requests using your CheapRouter API Key. Pass your API key in the <code>Authorization</code> HTTP header as a Bearer token. 
            </p>
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              color: 'var(--color-text-main)',
              fontSize: '13px',
            }}>
              <span style={{ color: 'var(--color-text-muted)' }}>// Example HTTP Header</span><br/>
              <span style={{ color: 'var(--color-primary)' }}>Authorization</span>: Bearer YOUR_API_KEY
            </div>
          </div>
        </div>
        
        {/* Right Column: Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Puzzle size={20} color="#f8fafc" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>What We Provide</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02, backgroundColor: 'var(--color-bg-card)' }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  cursor: 'default',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ 
                  backgroundColor: 'rgba(204, 0, 0, 0.1)', 
                  color: 'var(--color-primary)', 
                  padding: '12px', 
                  borderRadius: '12px' 
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>{feature.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
