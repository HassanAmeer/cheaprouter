'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Terminal, MessageSquare, Bot, Globe } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, Input } from '@/components/ui/primitives';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/components/ui/toast';
import styles from '../auth.module.css';
import AnnouncementBar from '@/components/AnnouncementBar';

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      toast(err.message ?? 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AnnouncementBar />
      <div className={styles.splitContainer} style={{ flex: 1, minHeight: 'calc(100vh - 48px)' }}>
        <div className={styles.leftSide}>
        <div className={styles.leftContent}>
          <Logo />
          <h1 className={styles.leftTitle}>Start Building with Cheap Rates.</h1>
          <p className={styles.leftSubtitle}>Join thousands of developers using our unified API endpoint to access GPT-4, Claude, and Gemini securely and cheaply.</p>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Zap size={20} /></div>
              Access all premium models at cheap rates
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Terminal size={20} /></div>
              Code seamlessly with our CLI tool
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><MessageSquare size={20} /></div>
              Chat directly with any model
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Bot size={20} /></div>
              Build intelligent AI agents
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Globe size={20} /></div>
              Create online websites with the web builder
            </div>
          </div>
        </div>
        <div className={`${styles.star} ${styles.star1}`}></div>
        <div className={`${styles.star} ${styles.star2}`}></div>
        <div className={`${styles.star} ${styles.star3}`}></div>
        <div className={`${styles.star} ${styles.star4}`}></div>
        <div className={`${styles.star} ${styles.star5}`}></div>
        <div className={`${styles.star} ${styles.star6}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar1}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar2}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar3}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar4}`}></div>
      </div>

      <div className={styles.rightSide}>
        <div style={{ position: 'absolute', top: 24, right: 24 }}><ThemeToggle /></div>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Get your free $5 welcome credits now</p>

          <form onSubmit={submit} autoComplete="off">
            <Input id="signupName" name="signupName" label="Full Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            <Input id="signupEmail" name="signupEmail" label="Email Address" type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            <Input id="signupPassword" name="signupPassword" label="Password" type="password" placeholder="••••••••" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <Button type="submit" fullWidth disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</Button>
          </form>

          <div className={styles.authFooter}>
            Already have an account? <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
    </main>
  );
}
