import { ClientType, SecretTypes } from "@/models/Clients/ClientModels";
import type { TFunction } from "i18next";

type TranslationKey = string;

/**
 * The FAPI 2.0 Security Profile has a JWT dated up to 10 seconds in the future accepted,
 * allows up to 60 seconds and nothing beyond, and names 30 seconds as the value ecosystems
 * needed to get rid of clock skew issues. The 5 minute default of IdentityServer is outside
 * of that, and the JWT clock skew of the server does not cover DPoP proofs - their skew is
 * a client setting.
 */
export const HIGH_SECURE_DPOP_CLOCK_SKEW_SECONDS = 30;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** The API takes the clock skew as a .NET TimeSpan - hh:mm:ss. */
const secondsToTimeSpan = (totalSeconds: number) =>
  [
    Math.floor(totalSeconds / SECONDS_PER_HOUR),
    Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    totalSeconds % SECONDS_PER_MINUTE,
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

const timeSpanToSeconds = (timeSpan: string) => {
  const [hours, minutes, seconds] = timeSpan.split(":").map(Number);

  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
};

export type EnforcedValues = Partial<{
  requirePkce: boolean;
  requireDPoP: boolean;
  requirePushedAuthorization: boolean;
  allowOfflineAccess: boolean;
  requireClientSecret: boolean;
  authorizationCodeLifetime: number;
  dPoPClockSkew: string;
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
    format?: (value: boolean | number | string, t: TFunction) => string;
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
  dPoPClockSkew: {
    labelKey: "Client.Label.DPoPClockSkew_Label",
    format: (v) => `${timeSpanToSeconds(String(v))} s`,
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
      dPoPClockSkew: secondsToTimeSpan(HIGH_SECURE_DPOP_CLOCK_SKEW_SECONDS),
    },
    descriptionLabels: [
      "Client.Label.RequirePkce_Label",
      "Client.Label.RequireDPoP_Label",
      "Client.Label.RequirePushedAuthorization_Label",
      "Client.Label.AllowOfflineAccess_Label",
      "Client.Label.RequireClientSecret_Label",
      "Client.Label.AuthorizationCodeLifetime_Label",
      "Client.Label.DPoPClockSkew_Label",
    ],
    lockedFields: [
      "requirePkce",
      "requireDPoP",
      "requirePushedAuthorization",
      "allowOfflineAccess",
      "requireClientSecret",
      "authorizationCodeLifetime",
      "dPoPClockSkew",
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
