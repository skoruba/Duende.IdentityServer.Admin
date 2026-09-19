import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import {
  HIGH_SECURE_DPOP_CLOCK_SKEW_SECONDS,
  clientTypeRules,
  enforcedFieldMeta,
  getSecretStepNotice,
} from "./ClientTypeRules";
import { mapFormDataToCreateClient } from "../../ClientSchema";
import {
  ClientType,
  GrantTypeIds,
  SecretTypes,
} from "@/models/Clients/ClientModels";
import translations from "@/i18n/translations.en.json";

/**
 * The wizard applies the rules of the chosen client type over the collected
 * form data and maps the result. Anything the rules leave out falls back to
 * the shared defaults, which is how a public client used to end up requiring a
 * secret it was never asked for.
 */
const createViaWizard = (clientType: ClientType) =>
  mapFormDataToCreateClient(
    {
      clientId: "wizard_client",
      clientName: "Wizard Client",
      ...clientTypeRules[clientType].enforcedValues,
    },
    [GrantTypeIds.AuthorizationCode],
  );

describe("client type rules", () => {
  it("creates a public client that does not require a secret", () => {
    const created = createViaWizard(ClientType.Public);

    expect(created.requireClientSecret).toBe(false);
    expect(created.requirePkce).toBe(true);
  });

  it("still requires a secret for the confidential and high security types", () => {
    expect(createViaWizard(ClientType.Confidential).requireClientSecret).toBe(
      true,
    );
    expect(createViaWizard(ClientType.HighSecure).requireClientSecret).toBe(
      true,
    );
  });

  it("locks every value it enforces, so the summary can show them", () => {
    for (const clientType of Object.values(ClientType)) {
      const { enforcedValues, lockedFields, descriptionLabels } =
        clientTypeRules[clientType];

      expect([...lockedFields].sort()).toEqual(
        Object.keys(enforcedValues).sort(),
      );
      expect(descriptionLabels).toHaveLength(lockedFields.length);
    }
  });

  it("starts a high security client with a JWK and everything else with a shared secret", () => {
    // FAPI 2.0 allows private_key_jwt or mTLS only, so the wizard must not
    // lead a high security client to a shared secret by default.
    expect(clientTypeRules[ClientType.HighSecure].defaultSecretType).toBe(
      SecretTypes.Jwk,
    );

    for (const clientType of Object.values(ClientType)) {
      if (clientType !== ClientType.HighSecure) {
        expect(clientTypeRules[clientType].defaultSecretType).toBe(
          SecretTypes.SharedSecret,
        );
      }
    }
  });

  it("does not enforce the secret type, because mTLS is a valid choice too", () => {
    expect(
      Object.keys(clientTypeRules[ClientType.HighSecure].enforcedValues),
    ).not.toContain("secretType");
  });

  it("creates a high security client with a DPoP clock skew inside the FAPI 2.0 bounds", () => {
    // The profile accepts a JWT dated up to 10 seconds in the future and rejects
    // one dated more than 60 seconds ahead - the 5 minute default is outside of it.
    expect(HIGH_SECURE_DPOP_CLOCK_SKEW_SECONDS).toBeGreaterThanOrEqual(10);
    expect(HIGH_SECURE_DPOP_CLOCK_SKEW_SECONDS).toBeLessThanOrEqual(60);

    expect(createViaWizard(ClientType.HighSecure).dPoPClockSkew).toBe(
      "00:00:30",
    );
  });

  it("leaves the DPoP clock skew of the other client types on the default", () => {
    for (const clientType of Object.values(ClientType)) {
      if (clientType !== ClientType.HighSecure) {
        expect(createViaWizard(clientType).dPoPClockSkew).toBe("00:05:00");
      }
    }
  });

  it("shows the enforced DPoP clock skew in seconds, like the code lifetime", () => {
    const { dPoPClockSkew } = clientTypeRules[ClientType.HighSecure]
      .enforcedValues;
    const t = ((key: string) => key) as unknown as TFunction;

    expect(enforcedFieldMeta.dPoPClockSkew.format?.(dPoPClockSkew!, t)).toBe(
      "30 s",
    );
  });
});

describe("getSecretStepNotice", () => {
  it("explains the preselected JWK to a high security client", () => {
    expect(getSecretStepNotice(ClientType.HighSecure, SecretTypes.Jwk)).toEqual({
      kind: "tip",
      messageKey: "Client.Tips.HighSecureAuth",
    });
  });

  it("warns a high security client that switches to a shared secret", () => {
    expect(
      getSecretStepNotice(ClientType.HighSecure, SecretTypes.SharedSecret),
    ).toEqual({
      kind: "warning",
      messageKey: "Client.Tips.HighSecureSharedSecret",
    });
  });

  it("does not warn about certificate based secrets, which mTLS uses", () => {
    expect(
      getSecretStepNotice(ClientType.HighSecure, "X509Thumbprint")?.kind,
    ).toBe("tip");
  });

  it("stays quiet for the other client types, whatever the secret", () => {
    for (const clientType of Object.values(ClientType)) {
      if (clientType === ClientType.HighSecure) {
        continue;
      }

      for (const secretType of Object.values(SecretTypes)) {
        expect(getSecretStepNotice(clientType, secretType)).toBeNull();
      }
    }

    expect(getSecretStepNotice(undefined, SecretTypes.SharedSecret)).toBeNull();
  });

  it("only refers to messages that exist", () => {
    const tips = translations.Client.Tips as Record<string, string>;

    for (const secretType of Object.values(SecretTypes)) {
      const notice = getSecretStepNotice(ClientType.HighSecure, secretType);

      expect(tips[notice!.messageKey.replace("Client.Tips.", "")]).toBeTruthy();
    }
  });
});
