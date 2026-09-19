import { AuditLogTarget } from "@/lib/auditLogs/describeAuditLog";
import {
  ApiResourceEditUrl,
  ApiScopeEditUrl,
  ClientEditUrl,
} from "@/routing/Urls";

const ENTITY_ROUTES = {
  Client: { url: ClientEditUrl, param: ":clientId" },
  ApiResource: { url: ApiResourceEditUrl, param: ":resourceId" },
  ApiScope: { url: ApiScopeEditUrl, param: ":scopeId" },
} as const;

/** Translation key for "client #14" style labels. */
export const getTargetLabelKey = (
  target: Extract<AuditLogTarget, { type: "entity" }>,
) => `Home.RecentActivity.Target.${target.kind}` as const;

/** Edit page of the entity an id-only audit event belongs to. */
export const getTargetHref = (target?: AuditLogTarget): string | undefined => {
  if (target?.type !== "entity") return undefined;

  const route = ENTITY_ROUTES[target.kind];
  return route.url.replace(route.param, String(target.id));
};
