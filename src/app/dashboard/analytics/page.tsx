export default function AnalyticsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Usage Analytics</h1>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Token Usage Over Time</h2>
        <div style={{ height: '300px', width: '100%', backgroundColor: '#F9FAFB', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>[Chart Visualization Goes Here]</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Top Models Used</h2>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 500 }}>GPT-4o</span>
              <span>65,420 tokens</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 500 }}>Claude 3.5 Sonnet</span>
              <span>42,100 tokens</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontWeight: 500 }}>Gemini 1.5 Flash</span>
              <span>17,072 tokens</span>
            </li>
          </ul>
        </div>
        
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Cost Breakdown</h2>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 500 }}>GPT-4o</span>
              <span>$0.65</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 500 }}>Claude 3.5 Sonnet</span>
              <span>$0.12</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', color: 'var(--color-text-muted)' }}>
              <span style={{ fontWeight: 500 }}>Gemini 1.5 Flash (BYOK)</span>
              <span>$0.00</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
