'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type CohereSetupRef = BaseProviderSetupRef;

const CohereSetup = forwardRef<CohereSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_cohere"
      providerName="Cohere"
      apiSlug="cohere"
      iconUrl="https://www.google.com/s2/favicons?domain=cohere.com&sz=128"
      getKeyUrl="https://dashboard.cohere.com/api-keys"
      rawModelsUrl="https://api.cohere.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

CohereSetup.displayName = 'CohereSetup';
export default CohereSetup;
