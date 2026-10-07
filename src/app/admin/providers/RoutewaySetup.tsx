'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type RoutewaySetupRef = BaseProviderSetupRef;

const RoutewaySetup = forwardRef<RoutewaySetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_routeway"
      providerName="Routeway"
      apiSlug="routeway"
      iconUrl="https://www.google.com/s2/favicons?domain=routeway.ai&sz=128"
      getKeyUrl="https://routeway.ai/"
      rawModelsUrl="https://api.routeway.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

RoutewaySetup.displayName = 'RoutewaySetup';
export default RoutewaySetup;
