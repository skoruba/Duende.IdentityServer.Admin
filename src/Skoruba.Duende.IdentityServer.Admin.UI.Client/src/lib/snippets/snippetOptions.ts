/**
 * Defaults of the snippet options the user can override on the Integration tab.
 *
 * The authority follows the IdentityServer the Admin UI is configured with
 * (`Info/GetEnvironment`), so a deployed instance generates code pointing at its
 * own IdentityServer. The localhost authority is a last resort only: the local
 * template port, for a backend that reports no address.
 */

/** Authority used when the Admin UI reports no IdentityServer address. */
export const FALLBACK_AUTHORITY = "https://localhost:44310";

/**
 * The API the generated application calls is the user's own, so the Admin UI
 * cannot know its address. Until one is typed, the code carries an address that
 * is obviously not real (`.example` is reserved by RFC 2606) and the Program.cs
 * step warns about it - a plausible localhost address would only look right.
 */
export const PLACEHOLDER_API_BASE_URL = "https://your-api.example";

/** What 3.1.0 stored for the API address on its own - see readStoredOption. */
export const LEGACY_API_BASE_URL = "https://localhost:5001";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/** True when the generated code would call the placeholder instead of an API. */
export const isPlaceholderApiBaseUrl = (apiBaseUrl: string) =>
  trimTrailingSlash(apiBaseUrl.trim()) === PLACEHOLDER_API_BASE_URL;

/** The authority the snippets use unless the user typed one. */
export const resolveDefaultAuthority = (
  identityServerBaseUrl: string | null | undefined,
) => {
  const configured = identityServerBaseUrl?.trim();

  return configured ? trimTrailingSlash(configured) : FALLBACK_AUTHORITY;
};

/**
 * Turns a value read from local storage into the option the user typed.
 *
 * Version 3.1.0 stored the built-in localhost default on the first visit of the
 * tab, so that value cannot be told apart from a typed one. It is treated as
 * "not set" - the option then follows the configured default again. A user who
 * really wants the localhost address gets it from the default on a local
 * instance anyway.
 */
export const readStoredOption = (
  stored: string | null,
  legacyDefault: string,
) => (stored === null || stored === legacyDefault ? "" : stored);
