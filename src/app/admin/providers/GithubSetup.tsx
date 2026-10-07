'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type GithubSetupRef = BaseProviderSetupRef;

const GithubSetup = forwardRef<GithubSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_github"
      providerName="Github"
      apiSlug="github"
      iconUrl="https://www.google.com/s2/favicons?domain=github.com&sz=128"
      getKeyUrl="https://github.com/settings/tokens"
      rawModelsUrl="https://models.inference.ai.azure.com/models"
      placeholderKey="sk-..."
    />
  );
});

GithubSetup.displayName = 'GithubSetup';
export default GithubSetup;
