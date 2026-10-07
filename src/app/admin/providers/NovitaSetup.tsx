'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type NovitaSetupRef = BaseProviderSetupRef;

const NovitaSetup = forwardRef<NovitaSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_novita"
      providerName="Novita"
      apiSlug="novita"
      iconUrl="https://www.google.com/s2/favicons?domain=novita.com&sz=128"
      getKeyUrl="https://novita.ai/dashboard/key"
      rawModelsUrl="https://api.novita.ai/v3/openai/models"
      placeholderKey="sk-..."
    />
  );
});

NovitaSetup.displayName = 'NovitaSetup';
export default NovitaSetup;
