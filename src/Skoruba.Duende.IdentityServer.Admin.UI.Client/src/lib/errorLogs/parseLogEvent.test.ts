import { describe, expect, it } from "vitest";
import { parseLogEvent } from "./parseLogEvent";

describe("parseLogEvent", () => {
  it("reads the properties of the Serilog event", () => {
    const parsed = parseLogEvent(
      JSON.stringify({
        Level: "Error",
        Properties: {
          SourceContext: "Duende.IdentityServer.Validation",
          ApplicationName: "Skoruba.Duende.IdentityServer.STS.Identity",
          RequestPath: "/connect/authorize",
          Scope: ["openid", "profile"],
        },
      }),
    );

    expect(parsed.applicationName).toBe(
      "Skoruba.Duende.IdentityServer.STS.Identity",
    );
    expect(parsed.sourceContext).toBe("Duende.IdentityServer.Validation");
    expect(parsed.properties.map((p) => p.name)).toEqual([
      "ApplicationName",
      "RequestPath",
      "Scope",
      "SourceContext",
    ]);
    expect(parsed.properties.find((p) => p.name === "Scope")?.value).toBe(
      '["openid","profile"]',
    );
  });

  it("gives no properties for a missing or broken event", () => {
    expect(parseLogEvent(undefined)).toEqual({ properties: [] });
    expect(parseLogEvent("not json")).toEqual({ properties: [] });
    expect(parseLogEvent("[1,2]")).toEqual({ properties: [] });
    expect(parseLogEvent('{"Properties":"x"}')).toEqual({ properties: [] });
  });
});
