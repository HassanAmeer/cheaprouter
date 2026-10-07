'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type OpenCodeSetupRef = BaseProviderSetupRef;

const OpenCodeSetup = forwardRef<OpenCodeSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_opencode"
      providerName="OpenCode"
      apiSlug="opencode"
      iconUrl="https://www.google.com/s2/favicons?domain=opencode.ai&sz=128"
      getKeyUrl="https://opencode.ai/zen/api-keys"
      rawModelsUrl="https://opencode.ai/zen/v1/models"
      placeholderKey="sk-..."
    />
  );
});

OpenCodeSetup.displayName = 'OpenCodeSetup';
export default OpenCodeSetup;
