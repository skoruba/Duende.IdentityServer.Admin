type JsonObject = Record<string, unknown>;

// Ordered by how well the property identifies the changed entity.
const NAME_KEYS = [
  "ClientName",
  "ApiResourceName",
  "UserName",
  "Name",
  "DisplayName",
  "Scheme",
  "Email",
];
// Events about a sub-entity (a secret, a property) record only the numeric id of
// the owning entity - no name. A bare "#14" means nothing, so the id is reported
// together with what it identifies and the caller can name and link it.
export type AuditLogEntityKind = "Client" | "ApiResource" | "ApiScope";

const ENTITY_ID_KEYS: Array<{ key: string; kind: AuditLogEntityKind }> = [
  { key: "ClientId", kind: "Client" },
  { key: "ApiResourceId", kind: "ApiResource" },
  { key: "ApiScopeId", kind: "ApiScope" },
];

const MAX_DEPTH = 2;

const parseJson = (value?: string): JsonObject | undefined => {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as JsonObject)
      : undefined;
  } catch {
    return undefined;
  }
};

// Identity ids are GUIDs - they identify nothing for a human reader.
const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readKey = (obj: JsonObject, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = obj[key];
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !GUID_PATTERN.test(value)
    ) {
      return value;
    }
  }
  return undefined;
};

const findByKeys = (
  obj: JsonObject,
  keys: string[],
  depth = 0,
): string | undefined => {
  const direct = readKey(obj, keys);
  if (direct) return direct;
  if (depth >= MAX_DEPTH) return undefined;

  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nested = findByKeys(value as JsonObject, keys, depth + 1);
      if (nested) return nested;
    }
  }
  return undefined;
};

export type AuditLogTarget =
  | { type: "name"; name: string }
  | { type: "entity"; kind: AuditLogEntityKind; id: number };

const findEntityId = (
  obj: JsonObject,
  depth = 0,
): { kind: AuditLogEntityKind; id: number } | undefined => {
  for (const { key, kind } of ENTITY_ID_KEYS) {
    const value = obj[key];
    // 0 is not an id: deletions used to be audited with the owner id left at its default.
    if (typeof value === "number" && value > 0) return { kind, id: value };
  }
  if (depth >= MAX_DEPTH) return undefined;

  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nested = findEntityId(value as JsonObject, depth + 1);
      if (nested) return nested;
    }
  }
  return undefined;
};

/**
 * What an audit event is about, read from its data payload: the entity's name
 * when the payload has one, otherwise the id of the entity it belongs to.
 */
export const getAuditLogTarget = (data?: string): AuditLogTarget | undefined => {
  const parsed = parseJson(data);
  if (!parsed) return undefined;

  const name = findByKeys(parsed, NAME_KEYS);
  if (name) return { type: "name", name };

  const entity = findEntityId(parsed);
  return entity ? { type: "entity", ...entity } : undefined;
};

/** "POST /api/Clients" from the audit event's action payload. */
export const getAuditLogRequest = (action?: string): string | undefined => {
  const parsed = parseJson(action);
  const method = parsed?.HttpMethod;
  const url = parsed?.RequestUrl;
  if (typeof method !== "string" || typeof url !== "string") return undefined;

  try {
    return `${method} ${new URL(url).pathname}`;
  } catch {
    return `${method} ${url}`;
  }
};

export type AuditLogRequestInfo = {
  /** "POST /api/Clients" */
  request?: string;
  traceIdentifier?: string;
  remoteIpAddress?: string;
};

/** Request and caller details recorded in the action / subject payloads. */
export const getAuditLogRequestInfo = (
  action?: string,
  subjectAdditionalData?: string,
): AuditLogRequestInfo => {
  const trace = parseJson(action)?.TraceIdentifier;
  const ip = parseJson(subjectAdditionalData)?.RemoteIpAddress;

  return {
    request: getAuditLogRequest(action),
    traceIdentifier: typeof trace === "string" ? trace : undefined,
    remoteIpAddress: typeof ip === "string" && ip !== "" ? ip : undefined,
  };
};

/** Pretty printed payload, or the raw text when it is not JSON. */
export const formatAuditLogData = (data?: string): string | undefined => {
  if (!data || data.trim() === "" || data.trim() === "{}") return undefined;

  try {
    return JSON.stringify(JSON.parse(data), null, 2);
  } catch {
    return data;
  }
};
