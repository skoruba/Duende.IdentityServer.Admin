import { GrantTypeIds } from "@/models/Clients/ClientModels";

/**
 * Derives what a client can actually do from its grant types, so the edit form
 * can leave out settings that have no effect - a client credentials client has
 * no browser, no user and no refresh tokens, yet the form offers all of it.
 *
 * Grant types are the source of truth on purpose. The `skoruba_client_type`
 * property only exists on clients created by the wizard, so imported or
 * API-created clients would behave differently.
 */

export type ClientCapabilities = {
  /** Redirect, logout and CORS URIs - only browser-based flows use them. */
  usesBrowserFlow: boolean;
  /** A user is involved, so identity tokens, user claims and SSO apply. */
  usesUserAuthentication: boolean;
  /** The consent screen can be shown. */
  usesConsent: boolean;
  /** PKCE protects the authorization code, so only code-based flows use it. */
  usesPkce: boolean;
  /** Device flow settings apply. */
  usesDeviceFlow: boolean;
  /** CIBA settings apply. */
  usesCiba: boolean;
  /** Refresh tokens can be issued - never for client credentials. */
  usesRefreshTokens: boolean;
};

const BROWSER_FLOWS: string[] = [
  GrantTypeIds.AuthorizationCode,
  GrantTypeIds.Implicit,
  GrantTypeIds.Hybrid,
];

const USER_FLOWS: string[] = [
  ...BROWSER_FLOWS,
  GrantTypeIds.Password,
  GrantTypeIds.DeviceCode,
  GrantTypeIds.Ciba,
];

const CONSENT_FLOWS: string[] = [
  ...BROWSER_FLOWS,
  GrantTypeIds.DeviceCode,
  GrantTypeIds.Ciba,
];

const PKCE_FLOWS: string[] = [
  GrantTypeIds.AuthorizationCode,
  GrantTypeIds.Hybrid,
];

/**
 * The grants whose behaviour is modelled above. `delegation` is deliberately
 * missing - it is an extension grant that can mean anything, so a client using
 * it falls into the permissive branch below.
 */
const MODELLED_GRANT_TYPES: string[] = [
  ...USER_FLOWS,
  GrantTypeIds.ClientCredentials,
];

export const ALL_CAPABILITIES: ClientCapabilities = {
  usesBrowserFlow: true,
  usesUserAuthentication: true,
  usesConsent: true,
  usesPkce: true,
  usesDeviceFlow: true,
  usesCiba: true,
  usesRefreshTokens: true,
};

/**
 * Anything we do not model - an empty list, `delegation` or a custom extension
 * grant - gets every capability. Hiding a setting is a convenience, so the
 * uncertain case falls on the side of showing too much rather than too little.
 */
export const getClientCapabilities = (
  grantTypes: string[],
): ClientCapabilities => {
  const hasUnmodelledGrantType = grantTypes.some(
    (grantType) => !MODELLED_GRANT_TYPES.includes(grantType),
  );

  if (grantTypes.length === 0 || hasUnmodelledGrantType) {
    return ALL_CAPABILITIES;
  }

  const includesAny = (flows: string[]) =>
    grantTypes.some((grantType) => flows.includes(grantType));

  const usesUserAuthentication = includesAny(USER_FLOWS);

  return {
    usesBrowserFlow: includesAny(BROWSER_FLOWS),
    usesUserAuthentication,
    usesConsent: includesAny(CONSENT_FLOWS),
    usesPkce: includesAny(PKCE_FLOWS),
    usesDeviceFlow: grantTypes.includes(GrantTypeIds.DeviceCode),
    usesCiba: grantTypes.includes(GrantTypeIds.Ciba),
    usesRefreshTokens: usesUserAuthentication,
  };
};

/** True when at least one capability is missing, i.e. something is hidden. */
export const hasHiddenCapabilities = (
  capabilities: ClientCapabilities,
): boolean => Object.values(capabilities).some((capability) => !capability);
