'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type ZenmuxSetupRef = BaseProviderSetupRef;

const ZenmuxSetup = forwardRef<ZenmuxSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_zenmux"
      providerName="Zenmux"
      apiSlug="zenmux"
      iconUrl="https://www.google.com/s2/favicons?domain=zenmux.ai&sz=128"
      getKeyUrl="https://zenmux.ai/"
      rawModelsUrl="https://api.zenmux.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

ZenmuxSetup.displayName = 'ZenmuxSetup';
export default ZenmuxSetup;
