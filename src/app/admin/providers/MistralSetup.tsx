'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type MistralSetupRef = BaseProviderSetupRef;

const MistralSetup = forwardRef<MistralSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_mistral"
      providerName="Mistral"
      apiSlug="mistral"
      iconUrl="https://www.google.com/s2/favicons?domain=mistral.com&sz=128"
      getKeyUrl="https://console.mistral.ai/api-keys/"
      rawModelsUrl="https://api.mistral.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

MistralSetup.displayName = 'MistralSetup';
export default MistralSetup;
