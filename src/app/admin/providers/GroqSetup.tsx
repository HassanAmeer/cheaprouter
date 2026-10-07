'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type GroqSetupRef = BaseProviderSetupRef;

const GroqSetup = forwardRef<GroqSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_groq"
      providerName="Groq"
      apiSlug="groq"
      iconUrl="https://www.google.com/s2/favicons?domain=groq.com&sz=128"
      getKeyUrl="https://console.groq.com/keys"
      rawModelsUrl="https://api.groq.com/openai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

GroqSetup.displayName = 'GroqSetup';
export default GroqSetup;
