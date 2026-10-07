'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type MoonshotSetupRef = BaseProviderSetupRef;

const MoonshotSetup = forwardRef<MoonshotSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_moonshot"
      providerName="Moonshot"
      apiSlug="moonshot"
      iconUrl="https://www.google.com/s2/favicons?domain=moonshot.cn&sz=128"
      getKeyUrl="https://platform.moonshot.cn/console/api-keys"
      rawModelsUrl="https://api.moonshot.cn/v1/models"
      placeholderKey="sk-..."
    />
  );
});

MoonshotSetup.displayName = 'MoonshotSetup';
export default MoonshotSetup;
