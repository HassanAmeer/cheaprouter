'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type SambaNovaSetupRef = BaseProviderSetupRef;

const SambaNovaSetup = forwardRef<SambaNovaSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_sambanova"
      providerName="SambaNova"
      apiSlug="sambanova"
      iconUrl="https://www.google.com/s2/favicons?domain=sambanova.com&sz=128"
      getKeyUrl="https://cloud.sambanova.ai/"
      rawModelsUrl="https://api.sambanova.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

SambaNovaSetup.displayName = 'SambaNovaSetup';
export default SambaNovaSetup;
