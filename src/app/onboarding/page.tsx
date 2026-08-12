'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Code2, Cpu, Target, ChevronRight, ChevronLeft, ArrowRight, Compass } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/primitives';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/components/ui/toast';

const STUDENT_OPTIONS = [
  { id: 'yes', label: 'Yes, I am a student', desc: "Great — students often get extra perks and free credits.", icon: GraduationCap },
  { id: 'no', label: 'No, I am not a student', desc: 'No problem — you can still get started for free.', icon: Code2 },
];

const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'New / Beginner', desc: "I'm just getting started with programming.", icon: Code2 },
  { id: 'intermediate', label: 'Intermediate', desc: "I can build projects and know a few languages.", icon: Cpu },
  { id: 'advanced', label: 'Pro / Expert', desc: "I ship production code regularly.", icon: Code2 },
  { id: 'not-programmer', label: 'Not a programmer', desc: "I mostly use tools and apps, not write code.", icon: Compass },
];

const USECASE_OPTIONS = [
  { id: 'api', label: 'API', desc: 'Call models from your own code', icon: Cpu },
  { id: 'cli', label: 'CLI', desc: 'Use models in your terminal', icon: Code2 },
  { id: 'chat', label: 'Chat', desc: 'Chat directly with any model', icon: Cpu },
  { id: 'ide', label: 'IDE', desc: 'AI inside your code editor', icon: Code2 },
  { id: 'extension', label: 'Extension', desc: 'Browser or editor extensions', icon: Compass },
  { id: 'agents', label: 'Agents', desc: 'Build intelligent AI agents', icon: Target },
];

const GOAL_OPTIONS = [
  { id: 'affiliate', label: 'Earn with Affiliate', desc: 'Promote CheapRouter and earn commissions.', icon: Target },
  { id: 'earn', label: 'Earn / Build products', desc: "I want to build apps, freelancing, or make money from my skills.", icon: Code2 },
  { id: 'free', label: 'Use models for free', desc: "I mostly want a free way to use great AI models.", icon: GraduationCap },
];

const steps = [
  { key: 'student', title: 'Are you a student?', subtitle: 'This helps us set up your account experience.' },
  { key: 'experience', title: 'What kind of developer are you?', subtitle: 'Tell us your experience level so we can tailor recommendations.' },
  { key: 'useCases', title: 'What do you want to use?', subtitle: 'Pick all that apply — you can change this later.' },
  { key: 'goal', title: 'What is your goal?', subtitle: 'Choose what matters most to you on CheapRouter.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();
  const { toast } = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [isStudent, setIsStudent] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const step = steps[stepIndex];

  const parseUseCases = (raw: string | null | undefined): string[] =>
    (raw || '').split(',').map(s => s.trim()).filter(Boolean);

  const canContinue = () => {
    if (step.key === 'student') return isStudent !== null;
    if (step.key === 'experience') return experience !== null;
    if (step.key === 'useCases') return useCases.length > 0;
    return goal !== null;
  };

  const toggleUseCase = (id: string) => {
    setUseCases(prev => (prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]));
  };

  const next = () => {
    if (!canContinue()) {
      toast('Please select an option to continue', 'warning');
      return;
    }
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const finish = async () => {
    if (!goal) return;
    setSaving(true);
    try {
      await completeOnboarding({
        isStudent: isStudent === 'yes',
        experienceLevel: experience ?? 'not-programmer',
        useCases,
        earningGoal: goal,
      });
      toast('Your preferences are saved. Welcome!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      toast(err.message ?? 'Failed to save your answers', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderOptions = (options: { id: string; label: string; desc: string; icon: any }[], selected: string | null, onSelect: (id: string) => void) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
      {options.map(opt => {
        const Icon = opt.icon;
        const active = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className="hover-lift"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              textAlign: 'left',
              padding: '20px',
              borderRadius: '18px',
              cursor: 'pointer',
              background: active ? 'var(--color-primary-soft)' : 'var(--color-card-bg)',
              border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              transition: 'all 0.2s',
              color: 'var(--color-text-main)',
            }}
          >
            <span style={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'var(--color-primary)' : 'var(--color-bg-soft)', color: active ? '#fff' : 'var(--color-primary)' }}>
              <Icon size={20} />
            </span>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>{opt.label}</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );

  const renderMultiOptions = (options: { id: string; label: string; desc: string; icon: any }[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
      {options.map(opt => {
        const Icon = opt.icon;
        const active = useCases.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggleUseCase(opt.id)}
            className="hover-lift"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 18px',
              borderRadius: '16px',
              cursor: 'pointer',
              background: active ? 'var(--color-primary-soft)' : 'var(--color-card-bg)',
              border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              transition: 'all 0.2s',
              color: 'var(--color-text-main)',
            }}
          >
            <span style={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'var(--color-primary)' : 'var(--color-bg-soft)', color: active ? '#fff' : 'var(--color-primary)' }}>
              <Icon size={18} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>{opt.label}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{opt.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="admin-auth-bg" style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'var(--color-bg-base)' }} />
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 10 }}><ThemeToggle /></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: 760, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <Logo />
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 24 }}>
            {steps.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: i <= stepIndex ? 'var(--color-primary)' : 'var(--color-border)',
                    transition: 'all 0.2s',
                  }}
                />
                {i < steps.length - 1 && <span style={{ width: 40, height: 2, background: i < stepIndex ? 'var(--color-primary)' : 'var(--color-border)' }} />}
              </div>
            ))}
          </div>

          <div className="card glass-card" style={{ padding: '44px', borderRadius: '28px' }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-primary)', marginBottom: 10 }}>
                Step {stepIndex + 1} of {steps.length}
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: 'var(--color-text-main)' }}>
                {step.title}
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: 8 }}>{step.subtitle}</p>
            </div>

            {step.key === 'student' && renderOptions(STUDENT_OPTIONS, isStudent, setIsStudent)}
            {step.key === 'experience' && renderOptions(EXPERIENCE_OPTIONS, experience, setExperience)}
            {step.key === 'useCases' && renderMultiOptions(USECASE_OPTIONS)}
            {step.key === 'goal' && renderOptions(GOAL_OPTIONS, goal, setGoal)}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 32, borderTop: '1px solid var(--color-border)', paddingTop: 24 }}>
              {stepIndex > 0 ? (
                <Button variant="ghost" onClick={back}>
                  <ChevronLeft size={16} style={{ marginRight: 6 }} /> Back
                </Button>
              ) : (
                <span />
              )}

              {stepIndex < steps.length - 1 ? (
                <Button onClick={next} style={{ display: 'flex', alignItems: 'center' }}>
                  Continue <ChevronRight size={16} style={{ marginLeft: 6 }} />
                </Button>
              ) : (
                <Button onClick={finish} disabled={saving} style={{ display: 'flex', alignItems: 'center' }}>
                  {saving ? 'Saving…' : <>Get Started <ArrowRight size={16} style={{ marginLeft: 6 }} /></>}
                </Button>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => router.push(user?.onboarding_completed ? '/dashboard' : '/dashboard')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Skip for now — go to dashboard
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {user ? `${user.name} (${user.email})` : ''}
          </div>
        </div>
      </div>
    </main>
  );
}