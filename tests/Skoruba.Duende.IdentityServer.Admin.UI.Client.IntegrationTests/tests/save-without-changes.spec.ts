import { faker } from "@faker-js/faker";
import { expect, test, type Page } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "./helpers/auth";
import type { ApiEntity } from "./helpers/admin-api";
import {
  expectSaveWithoutChangesKeepsStoredData,
  type UntouchedSaveCase,
} from "./helpers/untouched-save";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

function newMarker(): string {
  return faker.string.alphanumeric({ length: 10, casing: "lower" });
}

function waitForInput(name: string, field: string) {
  return async (page: Page, stored: ApiEntity): Promise<void> => {
    await expect(page.locator(`[name="${name}"]`).first()).toHaveValue(
      String(stored[field]),
      { timeout: 60_000 },
    );
  };
}

/**
 * Every entity comes in two shapes, so each field is stored once with a value
 * the form would never write on its own:
 * - sparse: NULL in every optional column (as older versions and other tools
 *   leave it), every switch off, enums at zero, empty collections;
 * - full: every field filled with a value other than the default, every switch
 *   on, collections with items - including values the form does not offer.
 */
type CaseFactory = (marker: string) => UntouchedSaveCase;

const clientCase =
  (payload: (marker: string) => ApiEntity): CaseFactory =>
  (marker) => ({
    resource: "Clients",
    payload: payload(marker),
    editUrl: (id) => `/client/${id}`,
    waitForForm: waitForInput("clientId", "clientId"),
    volatileFields: ["updated"],
  });

const cases: Record<string, CaseFactory> = {
  "sparse client": clientCase((marker) => ({
    clientId: `untouched_sparse_${marker}`,
    clientName: `Untouched sparse ${marker}`,
    description: null,
    clientUri: null,
    logoUri: null,
    frontChannelLogoutUri: null,
    backChannelLogoutUri: null,
    clientClaimsPrefix: null,
    pairWiseSubjectSalt: null,
    userCodeType: null,
    initiateLoginUri: null,
    consentLifetime: null,
    userSsoLifetime: null,
    cibaLifetime: null,
    pollingInterval: null,
    pushedAuthorizationLifetime: null,
    enabled: false,
    enableLocalLogin: false,
    requireClientSecret: false,
    requireConsent: false,
    allowRememberConsent: false,
    frontChannelLogoutSessionRequired: false,
    backChannelLogoutSessionRequired: false,
    accessTokenType: 0,
    refreshTokenUsage: 0,
    refreshTokenExpiration: 0,
    dPoPValidationMode: 0,
    absoluteRefreshTokenLifetime: 1_000,
    accessTokenLifetime: 1_001,
    authorizationCodeLifetime: 1_002,
    identityTokenLifetime: 1_003,
    slidingRefreshTokenLifetime: 1_004,
    deviceCodeLifetime: 1_005,
    dPoPClockSkew: "00:00:00",
    allowedGrantTypes: [],
    allowedScopes: [],
    redirectUris: [],
    postLogoutRedirectUris: [],
    allowedCorsOrigins: [],
    identityProviderRestrictions: [],
    allowedIdentityTokenSigningAlgorithms: [],
    claims: [],
    properties: [],
  })),

  "full client": clientCase((marker) => ({
    clientId: `untouched_full_${marker}`,
    clientName: `Untouched full ${marker}`,
    description: `Description ${marker}`,
    clientUri: `https://full-${marker}.example.com/about`,
    logoUri: `https://full-${marker}.example.com/logo.png`,
    frontChannelLogoutUri: `https://full-${marker}.example.com/front-logout`,
    backChannelLogoutUri: `https://full-${marker}.example.com/back-logout`,
    clientClaimsPrefix: `custom_${marker}_`,
    pairWiseSubjectSalt: `salt_${marker}`,
    protocolType: "wsfed",
    userCodeType: `code_${marker}`,
    initiateLoginUri: `https://full-${marker}.example.com/login`,
    consentLifetime: 2_000,
    userSsoLifetime: 2_001,
    cibaLifetime: 2_002,
    pollingInterval: 7,
    pushedAuthorizationLifetime: 2_003,
    enabled: true,
    enableLocalLogin: true,
    requireClientSecret: true,
    requireConsent: true,
    allowRememberConsent: true,
    frontChannelLogoutSessionRequired: true,
    backChannelLogoutSessionRequired: true,
    allowAccessTokensViaBrowser: true,
    allowOfflineAccess: true,
    allowPlainTextPkce: true,
    alwaysIncludeUserClaimsInIdToken: true,
    alwaysSendClientClaims: true,
    includeJwtId: true,
    requirePkce: true,
    updateAccessTokenClaimsOnRefresh: true,
    requireRequestObject: true,
    coordinateLifetimeWithUserSession: true,
    requireDPoP: true,
    requirePushedAuthorization: true,
    accessTokenType: 1,
    refreshTokenUsage: 1,
    refreshTokenExpiration: 1,
    dPoPValidationMode: 3,
    absoluteRefreshTokenLifetime: 3_000,
    accessTokenLifetime: 3_001,
    authorizationCodeLifetime: 3_002,
    identityTokenLifetime: 3_003,
    slidingRefreshTokenLifetime: 3_004,
    deviceCodeLifetime: 3_005,
    dPoPClockSkew: "00:07:30",
    allowedGrantTypes: ["authorization_code", "client_credentials", `custom_${marker}`],
    allowedScopes: ["openid", "profile", `custom_scope_${marker}`],
    redirectUris: [`https://full-${marker}.example.com/signin-oidc`],
    postLogoutRedirectUris: [`https://full-${marker}.example.com/signout-callback-oidc`],
    allowedCorsOrigins: [`https://full-${marker}.example.com`],
    identityProviderRestrictions: [`idp_${marker}`],
    allowedIdentityTokenSigningAlgorithms: ["RS256", "ES256"],
    claims: [{ type: `claim_${marker}`, value: `claim_value_${marker}` }],
    properties: [{ key: `property_${marker}`, value: `property_value_${marker}` }],
    nonEditable: true,
    lastAccessed: "2026-01-02T03:04:05.678",
  })),

  "sparse API resource": (marker) => ({
    resource: "ApiResources",
    payload: {
      name: `untouched_sparse_${marker}`,
      displayName: null,
      description: null,
      enabled: false,
      showInDiscoveryDocument: false,
      requireResourceIndicator: false,
      userClaims: [],
      scopes: [],
      allowedAccessTokenSigningAlgorithms: [],
    },
    editUrl: (id) => `/api-resource/${id}`,
    waitForForm: waitForInput("name", "name"),
  }),

  "full API resource": (marker) => ({
    resource: "ApiResources",
    payload: {
      name: `untouched_full_${marker}`,
      displayName: `Display ${marker}`,
      description: `Description ${marker}`,
      enabled: true,
      showInDiscoveryDocument: true,
      requireResourceIndicator: true,
      userClaims: ["email", `claim_${marker}`],
      scopes: [`scope_${marker}`],
      allowedAccessTokenSigningAlgorithms: ["RS256", "PS256"],
    },
    editUrl: (id) => `/api-resource/${id}`,
    waitForForm: waitForInput("name", "name"),
  }),

  "sparse API scope": (marker) => ({
    resource: "ApiScopes",
    payload: {
      name: `untouched_sparse_${marker}`,
      displayName: null,
      description: null,
      enabled: false,
      showInDiscoveryDocument: false,
      required: false,
      emphasize: false,
      userClaims: [],
    },
    editUrl: (id) => `/api-scope/${id}`,
    waitForForm: waitForInput("name", "name"),
  }),

  "full API scope": (marker) => ({
    resource: "ApiScopes",
    payload: {
      name: `untouched_full_${marker}`,
      displayName: `Display ${marker}`,
      description: `Description ${marker}`,
      enabled: true,
      showInDiscoveryDocument: true,
      required: true,
      emphasize: true,
      userClaims: ["email", `claim_${marker}`],
    },
    editUrl: (id) => `/api-scope/${id}`,
    waitForForm: waitForInput("name", "name"),
  }),

  "sparse identity resource": (marker) => ({
    resource: "IdentityResources",
    payload: {
      name: `untouched_sparse_${marker}`,
      displayName: null,
      description: null,
      enabled: false,
      showInDiscoveryDocument: false,
      required: false,
      emphasize: false,
      userClaims: [],
    },
    editUrl: (id) => `/identity-resource/${id}`,
    waitForForm: waitForInput("name", "name"),
  }),

  "full identity resource": (marker) => ({
    resource: "IdentityResources",
    payload: {
      name: `untouched_full_${marker}`,
      displayName: `Display ${marker}`,
      description: `Description ${marker}`,
      enabled: true,
      showInDiscoveryDocument: true,
      required: true,
      emphasize: true,
      userClaims: ["email", `claim_${marker}`],
    },
    editUrl: (id) => `/identity-resource/${id}`,
    waitForForm: waitForInput("name", "name"),
  }),

  "sparse identity provider": (marker) => ({
    resource: "IdentityProviders",
    payload: {
      scheme: `untouched_sparse_${marker}`,
      type: "oidc",
      displayName: `Display ${marker}`,
      enabled: false,
      identityProviderProperties: {},
    },
    editUrl: (id) => `/identity-provider/${id}`,
    waitForForm: waitForInput("scheme", "scheme"),
  }),

  "full identity provider": (marker) => ({
    resource: "IdentityProviders",
    payload: {
      scheme: `untouched_full_${marker}`,
      type: "oidc",
      displayName: `Display ${marker}`,
      enabled: true,
      identityProviderProperties: {
        Authority: `https://idp-${marker}.example.com`,
        ClientId: `client_${marker}`,
        Scope: "openid profile",
      },
    },
    editUrl: (id) => `/identity-provider/${id}`,
    waitForForm: waitForInput("scheme", "scheme"),
  }),

  "sparse user": (marker) => ({
    resource: "Users",
    payload: {
      userName: `untouched_sparse_${marker}`,
      email: `untouched_sparse_${marker}@example.com`,
      phoneNumber: null,
      emailConfirmed: false,
      phoneNumberConfirmed: false,
      lockoutEnabled: false,
      twoFactorEnabled: false,
      accessFailedCount: 0,
      lockoutEnd: null,
    },
    editUrl: (id) => `/user-profile/${id}`,
    waitForForm: waitForInput("userName", "userName"),
  }),

  "full user": (marker) => ({
    resource: "Users",
    payload: {
      userName: `untouched_full_${marker}`,
      email: `untouched_full_${marker}@example.com`,
      phoneNumber: "+420123456789",
      emailConfirmed: true,
      phoneNumberConfirmed: true,
      lockoutEnabled: true,
      twoFactorEnabled: true,
      accessFailedCount: 2,
      lockoutEnd: "2099-01-02T03:04:05.678+00:00",
    },
    editUrl: (id) => `/user-profile/${id}`,
    waitForForm: waitForInput("userName", "userName"),
  }),

  role: (marker) => ({
    resource: "Roles",
    payload: { name: `untouched_${marker}` },
    editUrl: (id) => `/role/${id}`,
    waitForForm: waitForInput("name", "name"),
  }),
};

test.describe("Saving an edit form without changes keeps the stored data", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAndOpenClients(page, credentials);
  });

  for (const [name, createCase] of Object.entries(cases)) {
    test(name, async ({ page }) => {
      await expectSaveWithoutChangesKeepsStoredData(page, createCase(newMarker()));
    });
  }
});
