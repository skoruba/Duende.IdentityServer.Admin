import { describe, expect, it } from "vitest";
import { clientTypeRules } from "./ClientTypeRules";
import { mapFormDataToCreateClient } from "../../ClientSchema";
import { ClientType, GrantTypeIds } from "@/models/Clients/ClientModels";

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
});
