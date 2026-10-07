'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type ModelScopeSetupRef = BaseProviderSetupRef;

const ModelScopeSetup = forwardRef<ModelScopeSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_modelscope"
      providerName="ModelScope"
      apiSlug="modelscope"
      iconUrl="https://www.google.com/s2/favicons?domain=modelscope.cn&sz=128"
      getKeyUrl="https://modelscope.cn/"
      rawModelsUrl="https://api.modelscope.cn/v1/models"
      placeholderKey="sk-..."
    />
  );
});

ModelScopeSetup.displayName = 'ModelScopeSetup';
export default ModelScopeSetup;
