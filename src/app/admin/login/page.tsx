'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Zap } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      localStorage.setItem('admin_token', data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginTitle}>
            <Zap size={24} color="var(--color-primary)" fill="var(--color-primary)" />
            Admin Panel
          </div>
          <div className={styles.loginSubtitle}>Sign in to manage CheapAgents</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <div className={styles.errorBox}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Username</label>
            <input 
              type="text" 
              className={styles.formInput} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input 
              type="password" 
              className={styles.formInput} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              required 
            />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
