'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            <Zap size={28} color="var(--color-primary)" fill="var(--color-primary)" />
            Admin Panel
          </div>
          <div className={styles.loginSubtitle}>Sign in to manage CheapRouter</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} autoComplete="off">
          {error && <div className={styles.errorBox}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Username</label>
            <input 
              type="text" 
              className={styles.formInput} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="off"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className={styles.formInput} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                autoComplete="new-password"
                style={{ paddingRight: '42px', width: '100%' }}
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  transition: 'color 0.2s',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                Log In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
