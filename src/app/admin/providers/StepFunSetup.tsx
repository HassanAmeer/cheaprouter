'use client';
import React, { forwardRef } from 'react';
import BaseProviderSetup, { BaseProviderSetupRef } from './BaseProviderSetup';

export type StepFunSetupRef = BaseProviderSetupRef;

const StepFunSetup = forwardRef<StepFunSetupRef, { onModelsUpdated?: () => void; index?: number; byokEnabled?: boolean; onToggleByok?: () => void }>((props, ref) => {
  return (
    <BaseProviderSetup
      ref={ref}
      {...props}
      providerId="ap_stepfun"
      providerName="StepFun"
      apiSlug="stepfun"
      iconUrl="https://www.google.com/s2/favicons?domain=platform.stepfun.ai&sz=128"
      getKeyUrl="https://platform.stepfun.ai/"
      rawModelsUrl="https://api.stepfun.com/v1/models"
      placeholderKey="sk-..."
    />
  );
});

StepFunSetup.displayName = 'StepFunSetup';
export default StepFunSetup;
