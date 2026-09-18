import { ClientType, SecretTypes } from "@/models/Clients/ClientModels";
import type { TFunction } from "i18next";

type TranslationKey = string;

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
  /**
   * What the secret step starts with. A default rather than an enforced value:
   * the type can be changed, because not every client library can sign an
   * assertion and mTLS is a valid choice for a high security client as well.
   */
  defaultSecretType: string;
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
    defaultSecretType: SecretTypes.SharedSecret,
  },
  [ClientType.Public]: {
    enforcedValues: {
      requirePkce: true,
      requireClientSecret: false,
    },
    descriptionLabels: [
      "Client.Label.RequirePkce_Label",
      "Client.Label.RequireClientSecret_Label",
    ],
    lockedFields: ["requirePkce", "requireClientSecret"],
    defaultSecretType: SecretTypes.SharedSecret,
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
    defaultSecretType: SecretTypes.Jwk,
  },
  [ClientType.Machine]: {
    enforcedValues: {},
    descriptionLabels: [],
    lockedFields: [],
    defaultSecretType: SecretTypes.SharedSecret,
  },
};

/** What the wizard's secret step has to tell the user about the chosen secret type. */
export type SecretStepNotice =
  | { kind: "tip"; messageKey: TranslationKey }
  | { kind: "warning"; messageKey: TranslationKey };

/**
 * The high security type exists for FAPI 2.0 style clients, and the profile
 * allows private_key_jwt or mTLS only. A shared secret stays possible - the
 * edit form would allow it anyway - but not without saying what it costs.
 */
export const getSecretStepNotice = (
  clientType: ClientType | undefined,
  secretType: string | undefined,
): SecretStepNotice | null => {
  if (clientType !== ClientType.HighSecure) {
    return null;
  }

  return secretType === SecretTypes.SharedSecret
    ? { kind: "warning", messageKey: "Client.Tips.HighSecureSharedSecret" }
    : { kind: "tip", messageKey: "Client.Tips.HighSecureAuth" };
};
