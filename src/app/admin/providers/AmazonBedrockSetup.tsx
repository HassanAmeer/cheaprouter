'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type AmazonBedrockSetupRef = BaseProviderSetupRef;

const AmazonBedrockSetup = forwardRef<AmazonBedrockSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_amazonbedrock"
      providerName="AmazonBedrock"
      apiSlug="amazonbedrock"
      iconUrl="https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128"
      getKeyUrl="https://aws.amazon.com/bedrock/"
      rawModelsUrl="https://bedrock.proxy/v1/models"
      placeholderKey="sk-..."
    />
  );
});

AmazonBedrockSetup.displayName = 'AmazonBedrockSetup';
export default AmazonBedrockSetup;
