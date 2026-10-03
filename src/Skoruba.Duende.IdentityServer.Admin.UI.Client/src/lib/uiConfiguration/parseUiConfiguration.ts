/**
 * The host configuration the SPA reads at startup from GET /configuration
 * (AdminConfiguration:BasicConfiguration of the Admin UI host).
 */
export type UiConfiguration = {
  /**
   * Users and roles (ASP.NET Core Identity) are managed here. Off for
   * deployments that keep their users elsewhere.
   */
  identityManagementEnabled: boolean;
};

export const DEFAULT_UI_CONFIGURATION: UiConfiguration = {
  identityManagementEnabled: true,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Only an explicit false switches a feature off. A missing or malformed value
// keeps the default, so a host that does not know the flag yet shows the full
// UI, as before.
export const parseUiConfiguration = (raw: unknown): UiConfiguration => {
  const value = isRecord(raw) ? raw : {};

  return {
    identityManagementEnabled: value.identityManagementEnabled !== false,
  };
};
