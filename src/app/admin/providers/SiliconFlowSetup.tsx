'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type SiliconFlowSetupRef = BaseProviderSetupRef;

const SiliconFlowSetup = forwardRef<SiliconFlowSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_siliconflow"
      providerName="SiliconFlow"
      apiSlug="siliconflow"
      iconUrl="https://www.google.com/s2/favicons?domain=siliconflow.cn&sz=128"
      getKeyUrl="https://siliconflow.cn/"
      rawModelsUrl="https://api.siliconflow.cn/v1/models"
      placeholderKey="sk-..."
    />
  );
});

SiliconFlowSetup.displayName = 'SiliconFlowSetup';
export default SiliconFlowSetup;
