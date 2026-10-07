'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type PollinationsSetupRef = BaseProviderSetupRef;

const PollinationsSetup = forwardRef<PollinationsSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_pollinations"
      providerName="Pollinations"
      apiSlug="pollinations"
      iconUrl="https://www.google.com/s2/favicons?domain=pollinations.ai&sz=128"
      getKeyUrl="https://pollinations.ai/"
      rawModelsUrl="https://text.pollinations.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

PollinationsSetup.displayName = 'PollinationsSetup';
export default PollinationsSetup;
