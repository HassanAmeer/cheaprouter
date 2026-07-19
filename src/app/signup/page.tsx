'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, Input } from '@/components/ui/primitives';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/components/ui/toast';
import styles from '../auth.module.css';

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
    <div className={styles.splitContainer}>
      <div className={styles.leftSide}>
        <div className={styles.leftContent}>
          <Logo />
          <h1 className={styles.leftTitle}>Start Building with Premium Models Today.</h1>
          <p className={styles.leftSubtitle}>Join thousands of developers using our unified API endpoint to access GPT-4, Claude, and Gemini securely and cheaply.</p>
        </div>
        <div className={styles.authWaves}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#CC0000"></path>
          </svg>
        </div>
      </div>

      <div className={styles.rightSide}>
        <div style={{ position: 'absolute', top: 24, right: 24 }}><ThemeToggle /></div>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Get your free $5 welcome credits now</p>

          <form onSubmit={submit}>
            <Input id="name" label="Full Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="email" label="Email Address" type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="password" label="Password" type="password" placeholder="••••••••" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" fullWidth disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</Button>
          </form>

          <div className={styles.authFooter}>
            Already have an account? <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
