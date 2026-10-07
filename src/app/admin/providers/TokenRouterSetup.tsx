'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type TokenRouterSetupRef = BaseProviderSetupRef;

const TokenRouterSetup = forwardRef<TokenRouterSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_tokenrouter"
      providerName="TokenRouter"
      apiSlug="tokenrouter"
      iconUrl="https://www.google.com/s2/favicons?domain=tokenrouter.com&sz=128"
      getKeyUrl="https://tokenrouter.com/"
      rawModelsUrl="https://api.tokenrouter.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

TokenRouterSetup.displayName = 'TokenRouterSetup';
export default TokenRouterSetup;
