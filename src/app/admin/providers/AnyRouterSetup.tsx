'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type AnyRouterSetupRef = BaseProviderSetupRef;

const AnyRouterSetup = forwardRef<AnyRouterSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_anyrouter"
      providerName="AnyRouter"
      apiSlug="anyrouter"
      iconUrl="https://www.google.com/s2/favicons?domain=anyrouter.dev&sz=128"
      getKeyUrl="https://anyrouter.dev/"
      rawModelsUrl="https://api.anyrouter.dev/v1/models"
      placeholderKey="sk-..."
    />
  );
});

AnyRouterSetup.displayName = 'AnyRouterSetup';
export default AnyRouterSetup;
