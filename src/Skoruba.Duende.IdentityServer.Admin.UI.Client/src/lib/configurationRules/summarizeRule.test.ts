import { describe, expect, it } from "vitest";
import { RuleMetadataLike, summarizeRule } from "./summarizeRule";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

const metadata: RuleMetadataLike[] = [
  {
    ruleType: "MissingPkce",
    displayName: "Missing PKCE",
    description: "Detects clients using authorization code flow without PKCE.",
    parameters: [],
  },
  {
    ruleType: "ClientRedirectUrisMustUseHttps",
    displayName: "Client Redirect URIs Must Use HTTPS",
    description: "Ensures all client redirect URIs use HTTPS.",
    parameters: [
      {
        name: "allowLocalhost",
        displayName: "Allow Localhost",
        type: "boolean",
        defaultValue: true,
      },
    ],
  },
  {
    ruleType: "ClientNameMustStartWith",
    displayName: "Client Name Must Start With",
    description: "Ensures client names start with a prefix.",
    parameters: [
      {
        name: "prefixes",
        displayName: "Required Prefixes",
        type: "array",
        defaultValue: ["Client "],
      },
    ],
  },
];

describe("summarizeRule", () => {
  it("takes the name and description from the metadata instead of the template", () => {
    expect(
      summarizeRule(
        {
          ruleType: "MissingPkce",
          messageTemplate: "Client uses authorization code flow without PKCE",
        },
        metadata,
        yesNo,
      ),
    ).toEqual({
      name: "Missing PKCE",
      description:
        "Detects clients using authorization code flow without PKCE.",
      parameters: [],
    });
  });

  it("shows the configured values of the parameters", () => {
    expect(
      summarizeRule(
        {
          ruleType: "ClientNameMustStartWith",
          configuration: '{"prefixes": ["app-", "svc-"]}',
        },
        metadata,
        yesNo,
      ).parameters,
    ).toEqual([{ label: "Required Prefixes", values: ["app-", "svc-"] }]);

    expect(
      summarizeRule(
        {
          ruleType: "ClientRedirectUrisMustUseHttps",
          configuration: '{"allowLocalhost": false}',
        },
        metadata,
        yesNo,
      ).parameters,
    ).toEqual([{ label: "Allow Localhost", values: ["No"] }]);
  });

  it("falls back to the default of a parameter the configuration leaves out", () => {
    for (const configuration of [undefined, "{}", "not json"]) {
      expect(
        summarizeRule(
          { ruleType: "ClientNameMustStartWith", configuration },
          metadata,
          yesNo,
        ).parameters,
      ).toEqual([{ label: "Required Prefixes", values: ["Client "] }]);
    }
  });

  it("leaves out a parameter without a value", () => {
    expect(
      summarizeRule(
        {
          ruleType: "ClientNameMustStartWith",
          configuration: '{"prefixes": []}',
        },
        metadata,
        yesNo,
      ).parameters,
    ).toEqual([]);
  });

  it("names a rule that is not registered after its key, without the namespace and the template", () => {
    const rule = {
      ruleType: "MyProject.ClientRedirectUriLimit",
      messageTemplate: "Client '{clientName}' has {count} redirect URIs",
    };

    for (const known of [metadata, undefined]) {
      expect(summarizeRule(rule, known, yesNo)).toEqual({
        name: "Client Redirect Uri Limit",
        parameters: [],
      });
    }
  });
});
