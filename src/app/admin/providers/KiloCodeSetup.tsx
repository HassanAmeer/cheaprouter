'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type KiloCodeSetupRef = BaseProviderSetupRef;

const KiloCodeSetup = forwardRef<KiloCodeSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_kilocode"
      providerName="KiloCode"
      apiSlug="kilocode"
      iconUrl="https://www.google.com/s2/favicons?domain=kilocode.ai&sz=128"
      getKeyUrl="https://kilocode.ai/"
      rawModelsUrl="https://api.kilocode.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

KiloCodeSetup.displayName = 'KiloCodeSetup';
export default KiloCodeSetup;
