import styles from '../dashboard.module.css';

export default function ApiKeysPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>API Keys</h1>
        <button className="btn-primary">+ Generate New Key</button>
      </div>
      
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        Use these keys to authenticate your API requests. Do not share your API keys in publicly accessible areas.
      </p>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '16px', color: 'var(--color-text-muted)', fontWeight: 500 }}>NAME</th>
              <th style={{ padding: '16px', color: 'var(--color-text-muted)', fontWeight: 500 }}>SECRET KEY</th>
              <th style={{ padding: '16px', color: 'var(--color-text-muted)', fontWeight: 500 }}>CREATED</th>
              <th style={{ padding: '16px', color: 'var(--color-text-muted)', fontWeight: 500 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '16px', fontWeight: 600 }}>Production App</td>
              <td style={{ padding: '16px', fontFamily: 'monospace' }}>cm-live-8f92...a1b2</td>
              <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>Jul 10, 2026</td>
              <td style={{ padding: '16px' }}>
                <button style={{ color: 'var(--color-primary)', fontWeight: 600, marginRight: '16px' }}>Copy</button>
                <button style={{ color: 'var(--color-text-muted)' }}>Revoke</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px', fontWeight: 600 }}>Testing Script</td>
              <td style={{ padding: '16px', fontFamily: 'monospace' }}>cm-test-4k21...9z8x</td>
              <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>Jul 15, 2026</td>
              <td style={{ padding: '16px' }}>
                <button style={{ color: 'var(--color-primary)', fontWeight: 600, marginRight: '16px' }}>Copy</button>
                <button style={{ color: 'var(--color-text-muted)' }}>Revoke</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
