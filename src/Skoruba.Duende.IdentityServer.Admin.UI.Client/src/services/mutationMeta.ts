import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /**
       * The mutation changes something the configuration rules validate (clients,
       * API resources / scopes, identity resources, their secrets and properties,
       * or the rules themselves), so the cached configuration issues are stale.
       */
      invalidatesConfigurationIssues?: boolean;
    };
  }
}

/**
 * Opt-in marker for such mutations. Re-validating runs every enabled rule over the
 * whole configuration, so unrelated writes (users, roles, providers, keys) must
 * not trigger it. A mutation that forgets the marker degrades gracefully: the
 * issue queries go stale on their own after two minutes and the Configuration
 * Issues page always refetches.
 */
export const configurationChangeMeta = {
  invalidatesConfigurationIssues: true,
} as const;
