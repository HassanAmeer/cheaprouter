'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type GoogleSetupRef = BaseProviderSetupRef;

const GoogleSetup = forwardRef<GoogleSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_google"
      providerName="Google"
      apiSlug="google"
      iconUrl="https://www.google.com/s2/favicons?domain=google.com&sz=128"
      getKeyUrl="https://aistudio.google.com/app/apikey"
      rawModelsUrl="https://generativelanguage.googleapis.com/v1beta/models"
      placeholderKey="sk-..."
    />
  );
});

GoogleSetup.displayName = 'GoogleSetup';
export default GoogleSetup;
