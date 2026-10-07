'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type HuggingFaceSetupRef = BaseProviderSetupRef;

const HuggingFaceSetup = forwardRef<HuggingFaceSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_huggingface"
      providerName="HuggingFace"
      apiSlug="huggingface"
      iconUrl="https://www.google.com/s2/favicons?domain=huggingface.co&sz=128"
      getKeyUrl="https://huggingface.co/settings/tokens"
      rawModelsUrl="https://api-inference.huggingface.co/v1/models"
      placeholderKey="sk-..."
    />
  );
});

HuggingFaceSetup.displayName = 'HuggingFaceSetup';
export default HuggingFaceSetup;
