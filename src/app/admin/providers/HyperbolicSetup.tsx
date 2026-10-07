'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type HyperbolicSetupRef = BaseProviderSetupRef;

const HyperbolicSetup = forwardRef<HyperbolicSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_hyperbolic"
      providerName="Hyperbolic"
      apiSlug="hyperbolic"
      iconUrl="https://www.google.com/s2/favicons?domain=hyperbolic.xyz&sz=128"
      getKeyUrl="https://app.hyperbolic.ai/"
      rawModelsUrl="https://api.hyperbolic.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

HyperbolicSetup.displayName = 'HyperbolicSetup';
export default HyperbolicSetup;
