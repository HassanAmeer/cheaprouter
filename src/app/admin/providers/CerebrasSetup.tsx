'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type CerebrasSetupRef = BaseProviderSetupRef;

const CerebrasSetup = forwardRef<CerebrasSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_cerebras"
      providerName="Cerebras"
      apiSlug="cerebras"
      iconUrl="https://www.google.com/s2/favicons?domain=cerebras.com&sz=128"
      getKeyUrl="https://inference.cerebras.ai/"
      rawModelsUrl="https://api.cerebras.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

CerebrasSetup.displayName = 'CerebrasSetup';
export default CerebrasSetup;
