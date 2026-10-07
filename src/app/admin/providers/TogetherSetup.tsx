'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type TogetherSetupRef = BaseProviderSetupRef;

const TogetherSetup = forwardRef<TogetherSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_together"
      providerName="Together"
      apiSlug="together"
      iconUrl="https://www.google.com/s2/favicons?domain=together.com&sz=128"
      getKeyUrl="https://api.together.xyz/settings/api-keys"
      rawModelsUrl="https://api.together.xyz/v1/models"
      placeholderKey="sk-..."
    />
  );
});

TogetherSetup.displayName = 'TogetherSetup';
export default TogetherSetup;
