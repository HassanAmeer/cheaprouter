'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type LLM7SetupRef = BaseProviderSetupRef;

const LLM7Setup = forwardRef<LLM7SetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_llm7"
      providerName="LLM7"
      apiSlug="llm7"
      iconUrl="https://www.google.com/s2/favicons?domain=llm7.io&sz=128"
      getKeyUrl="https://llm7.io/"
      rawModelsUrl="https://api.llm7.io/v1/models"
      placeholderKey="sk-..."
    />
  );
});

LLM7Setup.displayName = 'LLM7Setup';
export default LLM7Setup;
