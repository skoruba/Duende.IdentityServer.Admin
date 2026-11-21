import { describe, expect, it } from "vitest";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { groupHealthChecks } from "./healthChecks";

const { Healthy, Degraded, Unhealthy, Unknown } = client.SystemHealthStatus;

// The 13 checks AddIdSHealthChecks registers.
const CHECK_NAMES = [
  "ConfigurationDbContext",
  "PersistedGrantsDbContext",
  "IdentityDbContext",
  "LogDbContext",
  "AuditLogDbContext",
  "DataProtectionDbContext",
  "Identity Server",
  "ConfigurationDb",
  "PersistentGrantsDb",
  "IdentityDb",
  "LogDb",
  "AuditLogDb",
  "DataProtectionDb",
];

const report = (failing: Record<string, client.SystemHealthStatus> = {}) =>
  CHECK_NAMES.map((name) => ({ name, status: failing[name] ?? Healthy }));

describe("groupHealthChecks", () => {
  it("groups the two checks of a database into one component", () => {
    const components = groupHealthChecks(report());

    expect(components.map((component) => component.key)).toEqual([
      "IdentityServer",
      "ConfigurationDb",
      "OperationalDb",
      "IdentityDb",
      "DataProtectionDb",
      "AuditLogDb",
      "LogDb",
    ]);
    expect(components[2].checks).toEqual([
      { name: "PersistedGrantsDbContext", status: Healthy, part: "Connection" },
      { name: "PersistentGrantsDb", status: Healthy, part: "Query" },
    ]);
  });

  it("keeps every check", () => {
    const checks = groupHealthChecks(report()).flatMap(
      (component) => component.checks,
    );

    expect(checks).toHaveLength(CHECK_NAMES.length);
  });

  it("gives a component the worst status of its checks", () => {
    const components = groupHealthChecks(
      report({ LogDbContext: Degraded, LogDb: Unhealthy }),
    );

    expect(components[0]).toMatchObject({ key: "LogDb", status: Unhealthy });
  });

  it("lists the failing components first, the worst status on top", () => {
    const components = groupHealthChecks(
      report({
        AuditLogDb: Degraded,
        "Identity Server": Unhealthy,
        LogDb: Unhealthy,
      }),
    );

    expect(
      components
        .slice(0, 4)
        .map((component) => [component.key, component.status]),
    ).toEqual([
      ["IdentityServer", Unhealthy],
      ["LogDb", Unhealthy],
      ["AuditLogDb", Degraded],
      ["ConfigurationDb", Healthy],
    ]);
  });

  it("keeps a check of the host as a component of its own, after the known ones", () => {
    const components = groupHealthChecks([
      { name: "Redis", status: Healthy },
      { name: "Blob storage", status: Healthy },
      ...report(),
    ]);

    expect(components.slice(-2)).toEqual([
      {
        key: undefined,
        name: "Blob storage",
        status: Healthy,
        checks: [{ name: "Blob storage", status: Healthy, part: undefined }],
      },
      {
        key: undefined,
        name: "Redis",
        status: Healthy,
        checks: [{ name: "Redis", status: Healthy, part: undefined }],
      },
    ]);
  });

  it("does not take a check named like an object member for a known one", () => {
    const components = groupHealthChecks([
      { name: "constructor", status: Unknown },
      { status: Unhealthy },
    ]);

    expect(
      components.map((component) => [component.key, component.name]),
    ).toEqual([
      [undefined, ""],
      [undefined, "constructor"],
    ]);
  });
});
