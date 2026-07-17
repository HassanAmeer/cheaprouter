import React from 'react';
import ModelsTable from '../../../components/ModelsTable';

export default function DashboardModelsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Available Models</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Browse all supported models, view their capabilities, and token usage costs. You can use these models via the unified API.
        </p>
      </div>
      
      <ModelsTable />
    </div>
  );
}
