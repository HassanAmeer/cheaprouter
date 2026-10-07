'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type ClineCodeSetupRef = BaseProviderSetupRef;

const ClineCodeSetup = forwardRef<ClineCodeSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_clinecode"
      providerName="ClineCode"
      apiSlug="clinecode"
      iconUrl="https://www.google.com/s2/favicons?domain=clinecode.ai&sz=128"
      getKeyUrl="https://clinecode.ai/"
      rawModelsUrl="https://api.clinecode.ai/v1/models"
      placeholderKey="sk-..."
    />
  );
});

ClineCodeSetup.displayName = 'ClineCodeSetup';
export default ClineCodeSetup;
