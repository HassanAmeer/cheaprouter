'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type ZaiSetupRef = BaseProviderSetupRef;

const ZaiSetup = forwardRef<ZaiSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_zai"
      providerName="Zai"
      apiSlug="zai"
      iconUrl="https://www.google.com/s2/favicons?domain=z.ai&sz=128"
      getKeyUrl="https://z.ai/"
      rawModelsUrl="https://api.z.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

ZaiSetup.displayName = 'ZaiSetup';
export default ZaiSetup;
