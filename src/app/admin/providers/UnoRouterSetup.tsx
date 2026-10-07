'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type UnoRouterSetupRef = BaseProviderSetupRef;

const UnoRouterSetup = forwardRef<UnoRouterSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_unorouter"
      providerName="UnoRouter"
      apiSlug="unorouter"
      iconUrl="https://www.google.com/s2/favicons?domain=unorouter.com&sz=128"
      getKeyUrl="https://unorouter.com/"
      rawModelsUrl="https://api.unorouter.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

UnoRouterSetup.displayName = 'UnoRouterSetup';
export default UnoRouterSetup;
