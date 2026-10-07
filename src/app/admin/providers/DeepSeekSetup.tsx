'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type DeepSeekSetupRef = BaseProviderSetupRef;

const DeepSeekSetup = forwardRef<DeepSeekSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_deepseek"
      providerName="DeepSeek"
      apiSlug="deepseek"
      iconUrl="https://www.google.com/s2/favicons?domain=deepseek.com&sz=128"
      getKeyUrl="https://platform.deepseek.com/api_keys"
      rawModelsUrl="https://api.deepseek.com/models"
      placeholderKey="sk-..."
    />
  );
});

DeepSeekSetup.displayName = 'DeepSeekSetup';
export default DeepSeekSetup;
