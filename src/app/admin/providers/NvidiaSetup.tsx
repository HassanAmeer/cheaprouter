'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type NvidiaSetupRef = BaseProviderSetupRef;

const NvidiaSetup = forwardRef<NvidiaSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_nvidia"
      providerName="Nvidia"
      apiSlug="nvidia"
      iconUrl="https://www.google.com/s2/favicons?domain=nvidia.com&sz=128"
      getKeyUrl="https://nvidia.com/"
      rawModelsUrl="https://integrate.api.nvidia.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

NvidiaSetup.displayName = 'NvidiaSetup';
export default NvidiaSetup;
