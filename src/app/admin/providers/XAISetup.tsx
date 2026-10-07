'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type XAISetupRef = BaseProviderSetupRef;

const XAISetup = forwardRef<XAISetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_xai"
      providerName="XAI"
      apiSlug="xai"
      iconUrl="https://www.google.com/s2/favicons?domain=xai.com&sz=128"
      getKeyUrl="https://console.x.ai/"
      rawModelsUrl="https://api.x.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

XAISetup.displayName = 'XAISetup';
export default XAISetup;
