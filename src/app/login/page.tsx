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

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      toast(err.message ?? 'Login failed', 'error');
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
          <h1 className={styles.leftTitle}>Welcome Back</h1>
          <p className={styles.leftSubtitle}>Log in to manage your API keys, monitor usage analytics, and connect your own provider keys effortlessly.</p>
          
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
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Enter your email and password to continue</p>

          <form onSubmit={submit} autoComplete="off">
            <Input id="userEmail" name="userEmail" label="Email Address" type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            <Input id="userPassword" name="userPassword" label="Password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <Button type="submit" fullWidth disabled={loading}>{loading ? 'Signing in…' : 'Log In'}</Button>
          </form>

          <div className={styles.authFooter}>
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
    </main>
  );
}
