import { describe, expect, it } from "vitest";
import {
  getClientCapabilities,
  hasHiddenCapabilities,
} from "./clientCapabilities";
import { GrantTypeIds } from "@/models/Clients/ClientModels";

describe("getClientCapabilities", () => {
  it("grants nothing beyond tokens to a client credentials client", () => {
    expect(getClientCapabilities([GrantTypeIds.ClientCredentials])).toEqual({
      usesBrowserFlow: false,
      usesUserAuthentication: false,
      usesConsent: false,
      usesPkce: false,
      usesDeviceFlow: false,
      usesCiba: false,
      usesRefreshTokens: false,
    });
  });

  it("keeps the browser settings for the authorization code flow", () => {
    const capabilities = getClientCapabilities([
      GrantTypeIds.AuthorizationCode,
    ]);

    expect(capabilities.usesBrowserFlow).toBe(true);
    expect(capabilities.usesUserAuthentication).toBe(true);
    expect(capabilities.usesConsent).toBe(true);
    expect(capabilities.usesPkce).toBe(true);
    expect(capabilities.usesRefreshTokens).toBe(true);
    expect(capabilities.usesDeviceFlow).toBe(false);
    expect(capabilities.usesCiba).toBe(false);
  });

  it("gives the device flow a user and consent but no browser or PKCE", () => {
    const capabilities = getClientCapabilities([GrantTypeIds.DeviceCode]);

    expect(capabilities.usesDeviceFlow).toBe(true);
    expect(capabilities.usesUserAuthentication).toBe(true);
    expect(capabilities.usesConsent).toBe(true);
    expect(capabilities.usesBrowserFlow).toBe(false);
    expect(capabilities.usesPkce).toBe(false);
  });

  it("does not offer consent for the password grant", () => {
    const capabilities = getClientCapabilities([GrantTypeIds.Password]);

    expect(capabilities.usesUserAuthentication).toBe(true);
    expect(capabilities.usesRefreshTokens).toBe(true);
    expect(capabilities.usesConsent).toBe(false);
  });

  it("combines the capabilities of every grant type", () => {
    const capabilities = getClientCapabilities([
      GrantTypeIds.AuthorizationCode,
      GrantTypeIds.ClientCredentials,
    ]);

    expect(capabilities.usesBrowserFlow).toBe(true);
    expect(capabilities.usesPkce).toBe(true);
  });

  it.each([
    ["no grant types at all", []],
    ["a custom extension grant", ["urn:example:my-own-grant"]],
    // `delegation` is a known id whose semantics we do not model, so a client
    // using it must not lose every tab.
    ["delegation next to client credentials", [
      GrantTypeIds.ClientCredentials,
      GrantTypeIds.Delegation,
    ]],
  ])("grants every capability for %s", (_label, grantTypes) => {
    const capabilities = getClientCapabilities(grantTypes as string[]);

    expect(Object.values(capabilities).every(Boolean)).toBe(true);
    expect(hasHiddenCapabilities(capabilities)).toBe(false);
  });
});

describe("hasHiddenCapabilities", () => {
  it("reports a client whose grant types hide something", () => {
    expect(
      hasHiddenCapabilities(
        getClientCapabilities([GrantTypeIds.AuthorizationCode]),
      ),
    ).toBe(true);
  });
});
