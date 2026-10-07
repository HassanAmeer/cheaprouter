'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type BytezSetupRef = BaseProviderSetupRef;

const BytezSetup = forwardRef<BytezSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_bytez"
      providerName="Bytez"
      apiSlug="bytez"
      iconUrl="https://www.google.com/s2/favicons?domain=bytez.com&sz=128"
      getKeyUrl="https://bytez.com/"
      rawModelsUrl="https://api.bytez.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

BytezSetup.displayName = 'BytezSetup';
export default BytezSetup;
