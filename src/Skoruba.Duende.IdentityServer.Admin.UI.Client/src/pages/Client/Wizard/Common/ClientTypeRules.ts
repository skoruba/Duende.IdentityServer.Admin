import { ClientType } from "@/models/Clients/ClientModels";
import type { TFunction } from "i18next";

type TranslationKey = Parameters<TFunction>[0];

export type EnforcedValues = Partial<{
  requirePkce: boolean;
  requireDPoP: boolean;
  requirePushedAuthorization: boolean;
  allowOfflineAccess: boolean;
  requireClientSecret: boolean;
  authorizationCodeLifetime: number;
}>;

export interface ClientTypeRuleSet {
  enforcedValues: EnforcedValues;
  descriptionLabels: string[];
  lockedFields: (keyof NonNullable<EnforcedValues>)[];
}

export const enforcedFieldMeta: Record<
  keyof NonNullable<EnforcedValues>,
  {
    labelKey: TranslationKey;
    format?: (value: boolean | number, t: TFunction) => string;
  }
> = {
  requirePkce: {
    labelKey: "Client.Label.RequirePkce_Label",
    format: (v, t) => (v ? t("Actions.Yes") : t("Actions.No")),
  },
  requireDPoP: {
    labelKey: "Client.Label.RequireDPoP_Label",
    format: (v, t) => (v ? t("Actions.Yes") : t("Actions.No")),
  },
  requirePushedAuthorization: {
    labelKey: "Client.Label.RequirePushedAuthorization_Label",
    format: (v, t) => (v ? t("Actions.Yes") : t("Actions.No")),
  },
  allowOfflineAccess: {
    labelKey: "Client.Label.AllowOfflineAccess_Label",
    format: (v, t) => (v ? t("Actions.Yes") : t("Actions.No")),
  },
  requireClientSecret: {
    labelKey: "Client.Label.RequireClientSecret_Label",
    format: (v, t) => (v ? t("Actions.Yes") : t("Actions.No")),
  },
  authorizationCodeLifetime: {
    labelKey: "Client.Label.AuthorizationCodeLifetime_Label",
    format: (v) => `${v} s`,
  },
};

export const clientTypeRules: Record<ClientType, ClientTypeRuleSet> = {
  [ClientType.Confidential]: {
    enforcedValues: {
      requirePkce: true,
    },
    descriptionLabels: ["Client.Label.RequirePkce_Label"],
    lockedFields: ["requirePkce"],
  },
  [ClientType.Public]: {
    enforcedValues: {
      requirePkce: true,
    },
    descriptionLabels: ["Client.Label.RequirePkce_Label"],
    lockedFields: ["requirePkce"],
  },
  [ClientType.HighSecure]: {
    enforcedValues: {
      requirePkce: true,
      requireDPoP: true,
      requirePushedAuthorization: true,
      allowOfflineAccess: true,
      requireClientSecret: true,
      authorizationCodeLifetime: 60,
    },
    descriptionLabels: [
      "Client.Label.RequirePkce_Label",
      "Client.Label.RequireDPoP_Label",
      "Client.Label.RequirePushedAuthorization_Label",
      "Client.Label.AllowOfflineAccess_Label",
      "Client.Label.RequireClientSecret_Label",
      "Client.Label.AuthorizationCodeLifetime_Label",
    ],
    lockedFields: [
      "requirePkce",
      "requireDPoP",
      "requirePushedAuthorization",
      "allowOfflineAccess",
      "requireClientSecret",
      "authorizationCodeLifetime",
    ],
  },
  [ClientType.Machine]: {
    enforcedValues: {},
    descriptionLabels: [],
    lockedFields: [],
  },
};
