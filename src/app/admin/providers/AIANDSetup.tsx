'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type AIANDSetupRef = BaseProviderSetupRef;

const AIANDSetup = forwardRef<AIANDSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_aiand"
      providerName="ai&"
      apiSlug="aiand"
      iconUrl="https://www.google.com/s2/favicons?domain=aiand.com&sz=128"
      getKeyUrl="https://aiand.com/"
      rawModelsUrl="https://api.aiand.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

AIANDSetup.displayName = 'AIANDSetup';
export default AIANDSetup;
