import { client } from "@skoruba/duende.identityserver.admin.api.client";

const { Healthy, Degraded, Unhealthy, Unknown } = client.SystemHealthStatus;

/** What a health check of a database tests: that it can be reached, or that its table answers a query. */
export type HealthCheckPart = "Connection" | "Query";

export type HealthComponentKey =
  | "IdentityServer"
  | "ConfigurationDb"
  | "OperationalDb"
  | "IdentityDb"
  | "AuditLogDb"
  | "LogDb"
  | "DataProtectionDb";

export type HealthCheck = {
  name: string;
  status: client.SystemHealthStatus;
  part?: HealthCheckPart;
};

/** One thing the system depends on, with the health checks that watch it. */
export type HealthComponent = {
  /** Missing for a check the host registered itself: it is shown under its own name. */
  key?: HealthComponentKey;
  name: string;
  /** The worst status of its checks. */
  status: client.SystemHealthStatus;
  checks: HealthCheck[];
};

// The names AddIdSHealthChecks registers the checks under. Every database has two:
// the DbContext check connects to it, the other one queries one of its tables.
const KNOWN_CHECKS = new Map<
  string,
  { component: HealthComponentKey; part?: HealthCheckPart }
>(
  Object.entries({
    "Identity Server": { component: "IdentityServer" },
    ConfigurationDbContext: {
      component: "ConfigurationDb",
      part: "Connection",
    },
    ConfigurationDb: { component: "ConfigurationDb", part: "Query" },
    PersistedGrantsDbContext: {
      component: "OperationalDb",
      part: "Connection",
    },
    PersistentGrantsDb: { component: "OperationalDb", part: "Query" },
    IdentityDbContext: { component: "IdentityDb", part: "Connection" },
    IdentityDb: { component: "IdentityDb", part: "Query" },
    AuditLogDbContext: { component: "AuditLogDb", part: "Connection" },
    AuditLogDb: { component: "AuditLogDb", part: "Query" },
    LogDbContext: { component: "LogDb", part: "Connection" },
    LogDb: { component: "LogDb", part: "Query" },
    DataProtectionDbContext: {
      component: "DataProtectionDb",
      part: "Connection",
    },
    DataProtectionDb: { component: "DataProtectionDb", part: "Query" },
  }),
);

// From what signing in depends on to what only the Admin UI reads.
const COMPONENT_ORDER: HealthComponentKey[] = [
  "IdentityServer",
  "ConfigurationDb",
  "OperationalDb",
  "IdentityDb",
  "DataProtectionDb",
  "AuditLogDb",
  "LogDb",
];

// Worst first: the failing components are what the list is opened for.
const STATUS_ORDER: Record<client.SystemHealthStatus, number> = {
  [Unhealthy]: 0,
  [Degraded]: 1,
  [Unknown]: 2,
  [Healthy]: 3,
};

const PART_ORDER: HealthCheckPart[] = ["Connection", "Query"];

const componentOrder = (component: HealthComponent) =>
  component.key
    ? COMPONENT_ORDER.indexOf(component.key)
    : COMPONENT_ORDER.length;

/**
 * Health checks grouped by what they watch - the two checks of a database make one
 * component - ordered from the worst status to healthy.
 */
export const groupHealthChecks = (
  entries: readonly { name?: string; status: client.SystemHealthStatus }[],
): HealthComponent[] => {
  const components = new Map<string, HealthComponent>();

  for (const entry of entries) {
    const name = entry.name ?? "";
    const known = KNOWN_CHECKS.get(name);
    // A check of the host keeps a row of its own, apart from the known components
    const id = known ? `known:${known.component}` : `custom:${name}`;

    const component = components.get(id) ?? {
      key: known?.component,
      name: known?.component ?? name,
      status: entry.status,
      checks: [],
    };

    component.checks.push({ name, status: entry.status, part: known?.part });
    if (STATUS_ORDER[entry.status] < STATUS_ORDER[component.status]) {
      component.status = entry.status;
    }
    components.set(id, component);
  }

  for (const component of components.values()) {
    component.checks.sort(
      (a, b) =>
        (a.part ? PART_ORDER.indexOf(a.part) : 0) -
        (b.part ? PART_ORDER.indexOf(b.part) : 0),
    );
  }

  return [...components.values()].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      componentOrder(a) - componentOrder(b) ||
      a.name.localeCompare(b.name),
  );
};
