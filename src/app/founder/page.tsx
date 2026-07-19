'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Mail, Globe, Code, Rocket, Heart, Award } from 'lucide-react';
import { PixelatedCanvas } from '../../components/ui/pixelated-canvas';
import profileImage from '../../../assets/profilehasan.png';

export default function FounderPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-text-main)',
    }}>
      {/* Back link */}
      <div style={{ padding: '24px 32px' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500,
          transition: 'color 0.2s'
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 100px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: '9999px',
            background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
            fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.5px', marginBottom: '20px'
          }}>
            <Zap size={14} fill="currentColor" /> The Founder
          </div>
          <h1 style={{
            fontSize: '48px', fontWeight: 900, letterSpacing: '-1.5px',
            lineHeight: 1.1, marginBottom: '16px'
          }}>
            Meet <span style={{ color: 'var(--color-primary)' }}>Hasan</span>
          </h1>
          <p style={{
            color: 'var(--color-text-muted)', fontSize: '18px',
            maxWidth: '560px', margin: '0 auto', lineHeight: 1.7
          }}>
            The visionary behind CheapModels — on a mission to democratize AI access for every developer on the planet.
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start',
        }}>
          
          {/* Left: Interactive Pixelated Canvas */}
          <div style={{ position: 'sticky', top: '40px' }}>
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(204,0,0,0.08)',
            }}>
              <PixelatedCanvas
                src={profileImage.src}
                width={600}
                height={600}
                cellSize={2}
                dotScale={1}
                shape="square"
                backgroundColor="#000000"
                dropoutStrength={0.4}
                interactive
                distortionStrength={3}
                distortionRadius={80}
                distortionMode="swirl"
                followSpeed={0.2}
                jitterStrength={4}
                jitterSpeed={4}
                sampleAverage
                tintColor="#FFFFFF"
                tintStrength={0.2}
              />
            </div>
            <p style={{
              textAlign: 'center', marginTop: '16px',
              color: 'var(--color-text-muted)', fontSize: '13px',
              fontStyle: 'italic'
            }}>
              ✨ Hover over the image — it's interactive!
            </p>
          </div>

          {/* Right: Founder Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Bio Card */}
            <div style={{
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>About</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
                Hasan is the founder and creator of CheapModels — a unified AI API gateway that gives developers one key to access every major AI model in the world.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
                Driven by the belief that AI should be accessible, affordable, and simple to integrate, Hasan built CheapModels from scratch to eliminate the complexity of managing multiple AI provider APIs.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
                With a background in full-stack engineering and a passion for developer tools, Hasan designed every aspect of the platform — from the OpenAI-compatible API layer to the real-time analytics dashboard.
              </p>
            </div>

            {/* Vision Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(204,0,0,0.05), rgba(204,0,0,0.02))',
              border: '1px solid rgba(204,0,0,0.15)',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Rocket size={20} color="var(--color-primary)" /> Vision
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
                &ldquo;Every developer deserves access to the best AI models without drowning in complexity, cost, or vendor lock-in. CheapModels exists to make that future a reality — one API key, infinite possibilities.&rdquo;
              </p>
            </div>

            {/* What He Built */}
            <div style={{
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Code size={20} color="var(--color-primary)" /> What He Built
              </h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {[
                  { label: 'Unified AI API Gateway', desc: 'One endpoint for OpenAI, Anthropic, Google, Meta, DeepSeek & more' },
                  { label: 'OpenAI-Compatible SDK', desc: 'Drop-in replacement — change one line of code' },
                  { label: 'Real-time Analytics Dashboard', desc: 'Track tokens, cost, latency across all models' },
                  { label: 'Bring Your Own Key (BYOK)', desc: 'Free routing with your own provider keys' },
                  { label: 'Smart Fallback System', desc: 'Auto-retry and failover across providers' },
                  { label: 'Chat Playground', desc: 'Test and compare AI models side by side' },
                  { label: 'CLI Tool (cheap-cli)', desc: 'Terminal-based routing and configuration' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '22px', height: '22px', minWidth: '22px',
                      borderRadius: '50%', background: 'var(--color-success-soft)',
                      color: 'var(--color-success)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginTop: '2px',
                      fontSize: '12px'
                    }}>✓</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div style={{
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={20} color="var(--color-primary)" /> Milestones
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { value: '10K+', label: 'Developers Served' },
                  { value: '50M+', label: 'API Calls Processed' },
                  { value: '15+', label: 'AI Models Integrated' },
                  { value: '99.9%', label: 'Uptime Maintained' },
                ].map((s, i) => (
                  <div key={i} style={{
                    textAlign: 'center', padding: '20px 12px',
                    borderRadius: '12px', background: 'var(--color-bg-soft)',
                    border: '1px solid var(--color-border)',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect */}
            <div style={{
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Heart size={20} color="var(--color-primary)" /> Connect
              </h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { icon: <img src="https://cdn.simpleicons.org/github" width="18" height="18" alt="" style={{ filter: 'var(--icon-filter)' }} />, label: 'GitHub', href: '#' },
                  { icon: <img src="https://cdn.simpleicons.org/x" width="18" height="18" alt="" style={{ filter: 'var(--icon-filter)' }} />, label: 'Twitter/X', href: '#' },
                  { icon: <img src="https://cdn.simpleicons.org/linkedin" width="18" height="18" alt="" style={{ filter: 'var(--icon-filter)' }} />, label: 'LinkedIn', href: '#' },
                  { icon: <Mail size={18} />, label: 'Email', href: '#' },
                  { icon: <Globe size={18} />, label: 'Website', href: '#' },
                ].map((link, i) => (
                  <a key={i} href={link.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 18px', borderRadius: '10px',
                    background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-main)', fontSize: '14px', fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-main)'; }}
                  >
                    {link.icon} {link.label}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
