'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type PoixeSetupRef = BaseProviderSetupRef;

const PoixeSetup = forwardRef<PoixeSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; chatsEnabled?: boolean; onToggleByok?: () => void; onToggleChats?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_poixe"
      providerName="Poixe"
      apiSlug="poixe"
      iconUrl="https://www.google.com/s2/favicons?domain=poixe.com&sz=128"
      getKeyUrl="https://poixe.com/"
      rawModelsUrl="https://api.poixe.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

PoixeSetup.displayName = 'PoixeSetup';
export default PoixeSetup;
