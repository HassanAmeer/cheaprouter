'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type AgnesAISetupRef = BaseProviderSetupRef;

const AgnesAISetup = forwardRef<AgnesAISetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_agnesai"
      providerName="AgnesAI"
      apiSlug="agnesai"
      iconUrl="https://www.google.com/s2/favicons?domain=platform.agnes-ai.com&sz=128"
      getKeyUrl="https://platform.agnes-ai.com/"
      rawModelsUrl="https://api.agnes-ai.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

AgnesAISetup.displayName = 'AgnesAISetup';
export default AgnesAISetup;
