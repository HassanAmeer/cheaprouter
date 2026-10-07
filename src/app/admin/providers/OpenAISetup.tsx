'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type OpenAISetupRef = BaseProviderSetupRef;

const OpenAISetup = forwardRef<OpenAISetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_openai"
      providerName="OpenAI"
      apiSlug="openai"
      iconUrl="https://www.google.com/s2/favicons?domain=openai.com&sz=128"
      getKeyUrl="https://platform.openai.com/api-keys"
      rawModelsUrl="https://api.openai.com/v1/models"
      baseUrl="https://api.openai.com/v1"
      placeholderKey="sk-..."
    />
  );
});

OpenAISetup.displayName = 'OpenAISetup';
export default OpenAISetup;
