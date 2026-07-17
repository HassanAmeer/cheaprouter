import Link from 'next/link';
import styles from './dashboard.module.css';

export default function DashboardOverview() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Overview & Analytics</h1>
        <div style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
          Plan: <span style={{ color: 'var(--color-primary)' }}>Pro Developer</span>
        </div>
      </div>

      {/* Usage Progress Bars (NEW SECTIONS) */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {/* Platform Credits */}
        <div className="card glass-card" style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Platform Credits Usage</h3>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>245,102 / 1,000,000 Tokens</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-soft)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '24.5%', height: '100%', background: 'var(--color-primary)' }}></div>
          </div>
        </div>

        {/* BYOK Usage */}
        <div className="card glass-card" style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Own Provider Keys (BYOK)</h3>
              <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: 600 }}>Unlimited Limit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: '24px', fontWeight: 700 }}>45,200 <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Tokens Used</span></div>
               <Link href="/dashboard/providers" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Manage Providers</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Limits & Usage Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Available Limits (Tokens)</div>
          <div className={styles.statValue}>1,000,000</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Tokens Used</div>
          <div className={styles.statValue}>245,102</div>
          <div style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '8px', fontWeight: 600 }}>24.5% of Limit</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Remaining Tokens</div>
          <div className={styles.statValue}>754,898</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Custom Providers Added</div>
          <div className={styles.statValue}>2 <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 400 }}>(BYOK)</span></div>
        </div>
      </div>

      {/* Charts Area (CSS Dummy Chart) */}
      <div className="card glass-card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Usage Over Time</h2>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '16px', borderBottom: '2px solid var(--color-border)', borderLeft: '2px solid var(--color-border)' }}>
          {/* Dummy Bar Chart */}
          <div style={{ flex: 1, height: '40%', background: 'rgba(204,0,0,0.2)', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{position:'absolute', top:'-25px', left:'50%', transform:'translateX(-50%)', fontSize:'12px', fontWeight:600}}>Mon</span></div>
          <div style={{ flex: 1, height: '70%', background: 'var(--color-primary)', borderRadius: '4px 4px 0 0', position: 'relative', boxShadow: 'var(--shadow-glow)' }}><span style={{position:'absolute', top:'-25px', left:'50%', transform:'translateX(-50%)', fontSize:'12px', fontWeight:600}}>Tue</span></div>
          <div style={{ flex: 1, height: '50%', background: 'rgba(204,0,0,0.4)', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{position:'absolute', top:'-25px', left:'50%', transform:'translateX(-50%)', fontSize:'12px', fontWeight:600}}>Wed</span></div>
          <div style={{ flex: 1, height: '90%', background: 'var(--color-primary)', borderRadius: '4px 4px 0 0', position: 'relative', boxShadow: 'var(--shadow-glow)' }}><span style={{position:'absolute', top:'-25px', left:'50%', transform:'translateX(-50%)', fontSize:'12px', fontWeight:600}}>Thu</span></div>
          <div style={{ flex: 1, height: '30%', background: 'rgba(204,0,0,0.2)', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{position:'absolute', top:'-25px', left:'50%', transform:'translateX(-50%)', fontSize:'12px', fontWeight:600}}>Fri</span></div>
          <div style={{ flex: 1, height: '60%', background: 'rgba(204,0,0,0.5)', borderRadius: '4px 4px 0 0', position: 'relative' }}><span style={{position:'absolute', top:'-25px', left:'50%', transform:'translateX(-50%)', fontSize:'12px', fontWeight:600}}>Sat</span></div>
          <div style={{ flex: 1, height: '80%', background: 'var(--color-primary)', borderRadius: '4px 4px 0 0', position: 'relative', boxShadow: 'var(--shadow-glow)' }}><span style={{position:'absolute', top:'-25px', left:'50%', transform:'translateX(-50%)', fontSize:'12px', fontWeight:600}}>Sun</span></div>
        </div>
      </div>

    </div>
  );
}
