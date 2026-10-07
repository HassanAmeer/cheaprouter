'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type TokenHarborSetupRef = BaseProviderSetupRef;

const TokenHarborSetup = forwardRef<TokenHarborSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_tokenharbor"
      providerName="TokenHarbor"
      apiSlug="tokenharbor"
      iconUrl="https://www.google.com/s2/favicons?domain=tokenharbor.com&sz=128"
      getKeyUrl="https://tokenharbor.com/"
      rawModelsUrl="https://api.tokenharbor.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

TokenHarborSetup.displayName = 'TokenHarborSetup';
export default TokenHarborSetup;
