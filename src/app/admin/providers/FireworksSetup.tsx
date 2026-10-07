'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type FireworksSetupRef = BaseProviderSetupRef;

const FireworksSetup = forwardRef<FireworksSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_fireworks"
      providerName="Fireworks"
      apiSlug="fireworks"
      iconUrl="https://www.google.com/s2/favicons?domain=fireworks.ai&sz=128"
      getKeyUrl="https://fireworks.ai/api-keys"
      rawModelsUrl="https://api.fireworks.ai/inference/v1/models"
      placeholderKey="sk-..."
    />
  );
});

FireworksSetup.displayName = 'FireworksSetup';
export default FireworksSetup;
