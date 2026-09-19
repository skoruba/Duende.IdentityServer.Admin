import { describe, expect, it } from "vitest";
import {
  formatAuditLogData,
  getAuditLogRequest,
  getAuditLogRequestInfo,
  getAuditLogTarget,
} from "./describeAuditLog";

describe("getAuditLogTarget", () => {
  it("prefers the entity name", () => {
    const data = JSON.stringify({
      Client: { Id: 14, ClientId: "my_spa", ClientName: "My SPA" },
    });
    expect(getAuditLogTarget(data)).toEqual({ type: "name", name: "My SPA" });
  });

  it("reports which entity a bare id belongs to", () => {
    expect(getAuditLogTarget('{"Type":"JWK","ClientId":14}')).toEqual({
      type: "entity",
      kind: "Client",
      id: 14,
    });
    expect(getAuditLogTarget('{"ApiResourceId":3,"ApiSecretId":9}')).toEqual({
      type: "entity",
      kind: "ApiResource",
      id: 3,
    });
  });

  it("reads the owner name that newer secret events record", () => {
    expect(
      getAuditLogTarget('{"Type":"JWK","ClientId":14,"ClientName":"Web Portal"}'),
    ).toEqual({ type: "name", name: "Web Portal" });
    expect(
      getAuditLogTarget('{"ApiResourceId":3,"ApiResourceName":"orders_api","ApiSecretId":9}'),
    ).toEqual({ type: "name", name: "orders_api" });
  });

  it("falls back to the id for records written before the name was stored", () => {
    // the audit log is immutable: old rows never get the name
    expect(getAuditLogTarget('{"Type":"JWK","ClientId":14}')).toEqual({
      type: "entity",
      kind: "Client",
      id: 14,
    });
    // a client without a name is logged with a null / empty name
    expect(getAuditLogTarget('{"ClientId":14,"ClientName":null}')).toEqual({
      type: "entity",
      kind: "Client",
      id: 14,
    });
    expect(getAuditLogTarget('{"ClientId":14,"ClientName":""}')).toEqual({
      type: "entity",
      kind: "Client",
      id: 14,
    });
  });

  it("ignores ids that identify nothing on their own", () => {
    // a GUID user id and a generic numeric Id are noise for a reader
    expect(
      getAuditLogTarget(
        JSON.stringify({ Role: { UserId: "20fa5243-053f-4c27-bbf6-5694dc1e9749" } }),
      ),
    ).toBeUndefined();
    expect(getAuditLogTarget('{"Id":5}')).toBeUndefined();
    // historical deletions were audited with the owner id left at 0
    expect(getAuditLogTarget('{"ClientId":0,"ClientSecretId":9}')).toBeUndefined();
  });

  it("returns undefined for empty or invalid payloads", () => {
    expect(getAuditLogTarget("{}")).toBeUndefined();
    expect(getAuditLogTarget("not json")).toBeUndefined();
    expect(getAuditLogTarget(undefined)).toBeUndefined();
  });
});

describe("getAuditLogRequest", () => {
  it("formats the method with the request path", () => {
    const action = JSON.stringify({
      TraceIdentifier: "0HNOLJA364622:0000042D",
      RequestUrl: "https://localhost:50445/api/Clients/14/Secrets",
      HttpMethod: "POST",
    });
    expect(getAuditLogRequest(action)).toBe("POST /api/Clients/14/Secrets");
  });

  it("returns undefined when the action carries no request", () => {
    expect(getAuditLogRequest("{}")).toBeUndefined();
    expect(getAuditLogRequest(undefined)).toBeUndefined();
  });
});

describe("getAuditLogRequestInfo", () => {
  it("collects the request, trace id and caller IP", () => {
    const info = getAuditLogRequestInfo(
      '{"TraceIdentifier":"0HNOLJ:42","RequestUrl":"https://host/api/Clients","HttpMethod":"POST"}',
      '{"RemoteIpAddress":"::1","LocalIpAddress":"::1","Claims":[]}',
    );

    expect(info).toEqual({
      request: "POST /api/Clients",
      traceIdentifier: "0HNOLJ:42",
      remoteIpAddress: "::1",
    });
  });

  it("tolerates missing payloads", () => {
    expect(getAuditLogRequestInfo(undefined, "not json")).toEqual({
      request: undefined,
      traceIdentifier: undefined,
      remoteIpAddress: undefined,
    });
  });
});

describe("formatAuditLogData", () => {
  it("pretty prints JSON and hides empty payloads", () => {
    expect(formatAuditLogData('{"Type":"JWK"}')).toBe('{\n  "Type": "JWK"\n}');
    expect(formatAuditLogData("{}")).toBeUndefined();
    expect(formatAuditLogData(undefined)).toBeUndefined();
  });
});
