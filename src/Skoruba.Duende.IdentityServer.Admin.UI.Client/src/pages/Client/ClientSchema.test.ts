import { describe, expect, it } from "vitest";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import {
  formSchema,
  mapEditClientToFormData,
  mapFormDataToEditClient,
} from "./ClientSchema";

type Json = Record<string, unknown>;

/**
 * Property initializers of ClientApiDto: what the server stores for a property
 * the request leaves out. A field the edit form drops is only harmless when
 * this default is what was stored anyway.
 */
const serverDefaults: Json = {
  absoluteRefreshTokenLifetime: 2592000,
  accessTokenLifetime: 3600,
  accessTokenType: 0,
  allowRememberConsent: true,
  authorizationCodeLifetime: 300,
  frontChannelLogoutSessionRequired: true,
  backChannelLogoutSessionRequired: true,
  enabled: true,
  enableLocalLogin: true,
  identityTokenLifetime: 300,
  clientClaimsPrefix: "client_",
  protocolType: "oidc",
  refreshTokenExpiration: 1,
  refreshTokenUsage: 1,
  slidingRefreshTokenLifetime: 1296000,
  requireClientSecret: true,
  requireConsent: true,
  deviceCodeLifetime: 300,
  dPoPValidationMode: 0,
  dPoPClockSkew: "00:05:00",
};

/**
 * Time stamps the server keeps itself; the edit form does not send them.
 */
const serverManagedFields = new Set(["updated", "lastAccessed"]);

/**
 * Loads a client the way the API returns it, saves the form untouched and
 * returns the JSON body of the PUT request.
 */
const saveUntouched = (stored: Json): Json => {
  const formData = mapEditClientToFormData(client.ClientApiDto.fromJS(stored), []);
  const submitted = formSchema.parse(formData);
  const request = new client.ClientApiDto(
    mapFormDataToEditClient(submitted, stored.id as number),
  );

  return JSON.parse(JSON.stringify(request.toJSON()));
};

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const normalize = (value: unknown): unknown =>
  isEmpty(value) ? null : value;

/** What the server ends up storing for every field of the stored client. */
const storedAfterSave = (stored: Json): Json => {
  const request = saveUntouched(stored);

  return Object.fromEntries(
    Object.keys(stored)
      .filter((key) => !serverManagedFields.has(key))
      .map((key) => [
        key,
        normalize(key in request ? request[key] : serverDefaults[key]),
      ]),
  );
};

const expectedAfterSave = (stored: Json): Json =>
  Object.fromEntries(
    Object.entries(stored)
      .filter(([key]) => !serverManagedFields.has(key))
      .map(([key, value]) => [key, normalize(value)]),
  );

const sparseClient: Json = {
  id: 7,
  clientId: "sparse",
  clientName: "Sparse",
  description: null,
  clientUri: null,
  logoUri: null,
  frontChannelLogoutUri: null,
  backChannelLogoutUri: null,
  clientClaimsPrefix: null,
  pairWiseSubjectSalt: null,
  protocolType: "oidc",
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
  allowAccessTokensViaBrowser: false,
  allowOfflineAccess: false,
  allowPlainTextPkce: false,
  alwaysIncludeUserClaimsInIdToken: false,
  alwaysSendClientClaims: false,
  includeJwtId: false,
  requirePkce: false,
  updateAccessTokenClaimsOnRefresh: false,
  requireRequestObject: false,
  coordinateLifetimeWithUserSession: false,
  requireDPoP: false,
  requirePushedAuthorization: false,
  accessTokenType: 0,
  refreshTokenUsage: 0,
  refreshTokenExpiration: 0,
  dPoPValidationMode: 0,
  absoluteRefreshTokenLifetime: 1000,
  accessTokenLifetime: 1001,
  authorizationCodeLifetime: 1002,
  identityTokenLifetime: 1003,
  slidingRefreshTokenLifetime: 1004,
  deviceCodeLifetime: 1005,
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
  nonEditable: false,
};

const fullClient: Json = {
  ...sparseClient,
  clientId: "full",
  clientName: "Full",
  description: "Description",
  clientUri: "https://full.example.com/about",
  logoUri: "https://full.example.com/logo.png",
  frontChannelLogoutUri: "https://full.example.com/front-logout",
  backChannelLogoutUri: "https://full.example.com/back-logout",
  clientClaimsPrefix: "custom_",
  pairWiseSubjectSalt: "salt",
  protocolType: "wsfed",
  userCodeType: "code",
  initiateLoginUri: "https://full.example.com/login",
  consentLifetime: 2000,
  userSsoLifetime: 2001,
  cibaLifetime: 2002,
  pollingInterval: 7,
  pushedAuthorizationLifetime: 2003,
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
  dPoPClockSkew: "00:07:30",
  allowedGrantTypes: ["authorization_code", "custom_grant"],
  allowedScopes: ["openid", "custom_scope"],
  redirectUris: ["https://full.example.com/signin-oidc"],
  postLogoutRedirectUris: ["https://full.example.com/signout-callback-oidc"],
  allowedCorsOrigins: ["https://full.example.com"],
  identityProviderRestrictions: ["idp"],
  allowedIdentityTokenSigningAlgorithms: ["RS256", "ES256"],
  claims: [{ id: 3, type: "claim", value: "claim_value" }],
  properties: [{ id: 4, key: "property", value: "property_value" }],
  nonEditable: true,
};

describe("client edit form round trip", () => {
  it("keeps a client with every optional value empty as it is", () => {
    expect(storedAfterSave(sparseClient)).toEqual(
      expectedAfterSave(sparseClient),
    );
  });

  it("keeps a client with every value set as it is", () => {
    expect(storedAfterSave(fullClient)).toEqual(expectedAfterSave(fullClient));
  });

  it("shows a client claims prefix stored as NULL as no prefix", () => {
    const formData = mapEditClientToFormData(
      client.ClientApiDto.fromJS({ ...sparseClient, clientClaimsPrefix: null }),
      [],
    );

    expect(formData.clientClaimsPrefix).toBeUndefined();
  });

  it("sends an emptied client claims prefix instead of leaving it to the server default", () => {
    const request = saveUntouched({ ...fullClient, clientClaimsPrefix: null });

    expect(request).toHaveProperty("clientClaimsPrefix", "");
  });
});
