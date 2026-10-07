'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type PerplexitySetupRef = BaseProviderSetupRef;

const PerplexitySetup = forwardRef<PerplexitySetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_perplexity"
      providerName="Perplexity"
      apiSlug="perplexity"
      iconUrl="https://www.google.com/s2/favicons?domain=perplexity.com&sz=128"
      getKeyUrl="https://www.perplexity.ai/settings/api"
      rawModelsUrl="https://api.perplexity.ai/models"
      placeholderKey="sk-..."
    />
  );
});

PerplexitySetup.displayName = 'PerplexitySetup';
export default PerplexitySetup;
