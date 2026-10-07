'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type AIHordeSetupRef = BaseProviderSetupRef;

const AIHordeSetup = forwardRef<AIHordeSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_aihorde"
      providerName="AIHorde"
      apiSlug="aihorde"
      iconUrl="https://www.google.com/s2/favicons?domain=aihorde.net&sz=128"
      getKeyUrl="https://aihorde.net/"
      rawModelsUrl="https://aihorde.net/api/v2/status/models"
      placeholderKey="sk-..."
    />
  );
});

AIHordeSetup.displayName = 'AIHordeSetup';
export default AIHordeSetup;
