'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type OpenRouterSetupRef = BaseProviderSetupRef;

const OpenRouterSetup = forwardRef<OpenRouterSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_openrouter"
      providerName="OpenRouter"
      apiSlug="openrouter"
      iconUrl="https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128"
      getKeyUrl="https://openrouter.ai/keys"
      rawModelsUrl=""
      placeholderKey="sk-..."
    />
  );
});

OpenRouterSetup.displayName = 'OpenRouterSetup';
export default OpenRouterSetup;
