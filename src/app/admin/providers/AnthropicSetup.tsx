'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type AnthropicSetupRef = BaseProviderSetupRef;

const AnthropicSetup = forwardRef<AnthropicSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_anthropic"
      providerName="Anthropic"
      apiSlug="anthropic"
      iconUrl="https://www.google.com/s2/favicons?domain=anthropic.com&sz=128"
      getKeyUrl="https://console.anthropic.com/settings/keys"
      rawModelsUrl="https://api.anthropic.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

AnthropicSetup.displayName = 'AnthropicSetup';
export default AnthropicSetup;
