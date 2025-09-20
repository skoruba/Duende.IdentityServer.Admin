import {
  ClientStepType,
  GrantTypes,
  ClientType,
  ClientWizardExcludeOptions,
  ClientWizardAdditionData,
} from "@/models/Clients/ClientModels";
import { ClientBasicsStep } from "@/pages/Client/Wizard/Web/ClientBasicsStep";
import { ClientScopesStep } from "@/pages/Client/Wizard/Web/ClientScopesStep";
import { SecretStep } from "@/pages/Client/Wizard/Web/ClientSecretStep";
import ClientSummaryStep from "@/pages/Client/Wizard/Web/ClientSummaryStep";
import { ClientUrisStep } from "@/pages/Client/Wizard/Web/ClientUrisStep";

type StepConfig = {
  stepType: ClientStepType;
  component: React.ComponentType<any>;
};

type WizardConfig = Record<
  ClientType,
  {
    steps: StepConfig[];
    excludeOptions: ClientWizardExcludeOptions;
    additionalData: ClientWizardAdditionData;
  }
>;

export const CLIENT_WIZARD_CONFIG: WizardConfig = {
  [ClientType.Confidential]: {
    steps: [
      { stepType: ClientStepType.Basics, component: ClientBasicsStep },
      { stepType: ClientStepType.Uris, component: ClientUrisStep },
      { stepType: ClientStepType.Scopes, component: ClientScopesStep },
      { stepType: ClientStepType.Secrets, component: SecretStep },
      { stepType: ClientStepType.Review, component: ClientSummaryStep },
    ],
    excludeOptions: { consent: false, identityResources: false, uris: false },
    additionalData: { grantTypes: [GrantTypes.AuthorizationCode] },
  },
  [ClientType.Machine]: {
    steps: [
      {
        stepType: ClientStepType.Basics,
        component: ClientBasicsStep,
      },
      {
        stepType: ClientStepType.Scopes,
        component: ClientScopesStep,
      },
      { stepType: ClientStepType.Secrets, component: SecretStep },
      {
        stepType: ClientStepType.Review,
        component: ClientSummaryStep,
      },
    ],
    excludeOptions: { consent: true, identityResources: true, uris: true },
    additionalData: { grantTypes: [GrantTypes.ClientCreadentials] },
  },
  [ClientType.Public]: {
    steps: [
      { stepType: ClientStepType.Basics, component: ClientBasicsStep },
      { stepType: ClientStepType.Uris, component: ClientUrisStep },
      { stepType: ClientStepType.Scopes, component: ClientScopesStep },
      { stepType: ClientStepType.Review, component: ClientSummaryStep },
    ],
    excludeOptions: {
      consent: false,
      identityResources: false,
      uris: false,
      secrets: true,
    },
    additionalData: { grantTypes: [GrantTypes.AuthorizationCode] },
  },
  [ClientType.HighSecure]: {
    steps: [
      { stepType: ClientStepType.Basics, component: ClientBasicsStep },
      { stepType: ClientStepType.Uris, component: ClientUrisStep },
      { stepType: ClientStepType.Scopes, component: ClientScopesStep },
      { stepType: ClientStepType.Secrets, component: SecretStep },
      { stepType: ClientStepType.Review, component: ClientSummaryStep },
    ],
    excludeOptions: { consent: false, identityResources: false, uris: false },
    additionalData: { grantTypes: [GrantTypes.AuthorizationCode] },
  },
};

export const getStepsForClientType = (clientType: ClientType): number[] => {
  const config = CLIENT_WIZARD_CONFIG[clientType];
  return config.steps.map((stepConfig) => stepConfig.stepType);
};
