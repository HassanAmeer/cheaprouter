import Link from 'next/link';
import { Zap } from 'lucide-react';
import styles from '../auth.module.css';

export default function Signup() {
  return (
    <div className={styles.splitContainer}>
      {/* Left Visual Side */}
      <div className={styles.leftSide}>
        <div className={styles.leftContent}>
          <div style={{ fontSize: '32px', marginBottom: '40px', fontWeight: 800 }}>
            <span style={{ color: 'var(--color-primary)' }}><Zap size={32} fill="currentColor" /></span> CheapModels
          </div>
          <h1 className={styles.leftTitle}>Start Building with Premium Models Today.</h1>
          <p className={styles.leftSubtitle}>Join thousands of developers using our unified API endpoint to access GPT-4, Claude, and Gemini securely and cheaply.</p>
        </div>
        <div className={styles.authWaves}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#CC0000"></path>
          </svg>
        </div>
      </div>

      {/* Right Form Side */}
      <div className={styles.rightSide}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Get your free $5 welcome credits now</p>

          <form>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" placeholder="John Doe" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" placeholder="name@company.com" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="••••••••" required />
            </div>
            <Link href="/dashboard" className={`btn-primary ${styles.submitBtn}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Create Account</Link>
          </form>

          <div className={styles.authFooter}>
            Already have an account? <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
