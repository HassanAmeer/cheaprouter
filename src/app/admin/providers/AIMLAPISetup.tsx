'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type AIMLAPISetupRef = BaseProviderSetupRef;

const AIMLAPISetup = forwardRef<AIMLAPISetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_aimlapi"
      providerName="AIMLAPI"
      apiSlug="aimlapi"
      iconUrl="https://www.google.com/s2/favicons?domain=aimlapi.com&sz=128"
      getKeyUrl="https://aimlapi.com/"
      rawModelsUrl="https://api.aimlapi.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

AIMLAPISetup.displayName = 'AIMLAPISetup';
export default AIMLAPISetup;
