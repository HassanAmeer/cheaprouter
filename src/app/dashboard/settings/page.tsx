export default function SettingsPage() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Account Settings</h1>
      
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>Profile Information</h2>
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Full Name</label>
            <input type="text" defaultValue="John Doe" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Email Address</label>
            <input type="email" defaultValue="john@company.com" disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', background: '#F9FAFB', color: 'var(--color-text-muted)' }} />
          </div>
        </div>

        <button className="btn-primary">Save Changes</button>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>Billing & Plan</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Current Plan: Pro Developer</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>$20.00 / month. Renews on Aug 15, 2026.</div>
          </div>
          <button className="btn-secondary">Manage Billing</button>
        </div>
      </div>

      <div className="card" style={{ borderColor: 'rgba(204,0,0,0.2)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-primary)' }}>Danger Zone</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Once you delete your account, there is no going back. Please be certain.</p>
        <button className="btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>Delete Account</button>
      </div>

    </div>
  );
}
