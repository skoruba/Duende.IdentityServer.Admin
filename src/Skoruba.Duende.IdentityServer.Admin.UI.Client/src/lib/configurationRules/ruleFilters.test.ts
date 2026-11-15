import { describe, expect, it } from "vitest";
import {
  filterRules,
  hasRuleFilters,
  parseRuleFilters,
  RuleFilters,
} from "./ruleFilters";
import { RuleMetadataLike } from "./summarizeRule";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

const metadata: RuleMetadataLike[] = [
  {
    ruleType: "MissingPkce",
    displayName: "Missing PKCE",
    description: "Detects clients using authorization code flow without PKCE.",
    parameters: [],
  },
  {
    ruleType: "ClientIdMustStartWith",
    displayName: "Client ID Must Start With",
    description: "Ensures client identifiers follow a naming convention.",
    parameters: [
      {
        name: "prefixes",
        displayName: "Required Prefixes",
        type: "array",
        defaultValue: ["client_"],
      },
    ],
  },
  {
    ruleType: "ApiScopeMustHaveDisplayName",
    displayName: "API Scope Must Have Display Name",
    description: "Ensures all API scopes have a user-friendly display name.",
    parameters: [],
  },
];

const rules = [
  { ruleType: "MissingPkce", resourceType: "Client", isEnabled: true },
  {
    ruleType: "ClientIdMustStartWith",
    resourceType: "Client",
    isEnabled: false,
    configuration: '{"prefixes":["acme_"]}',
  },
  {
    ruleType: "ApiScopeMustHaveDisplayName",
    resourceType: "ApiScope",
    isEnabled: false,
  },
  {
    ruleType: "MyProject.ClientRedirectUriLimit",
    resourceType: "Client",
    isEnabled: true,
    messageTemplate: "Client '{clientName}' has {count} redirect URIs",
  },
];

const noFilters: RuleFilters = { search: "", resourceTypes: [], statuses: [] };

const found = (filters: Partial<RuleFilters>) =>
  filterRules(rules, metadata, { ...noFilters, ...filters }, yesNo).map(
    (rule) => rule.ruleType,
  );

describe("filterRules", () => {
  it("keeps every rule without filters", () => {
    expect(found({})).toHaveLength(rules.length);
    expect(found({ search: "   " })).toHaveLength(rules.length);
  });

  it("searches the name and the description whatever the letter case", () => {
    expect(found({ search: "pkce" })).toEqual(["MissingPkce"]);
    expect(found({ search: "USER-FRIENDLY" })).toEqual([
      "ApiScopeMustHaveDisplayName",
    ]);
  });

  it("searches the configured value of a parameter, not its default", () => {
    expect(found({ search: "acme_" })).toEqual(["ClientIdMustStartWith"]);
    expect(found({ search: "client_" })).toEqual([]);
  });

  it("searches the key, so a custom rule is found by its namespace", () => {
    expect(found({ search: "myproject" })).toEqual([
      "MyProject.ClientRedirectUriLimit",
    ]);
    expect(found({ search: "redirect uri limit" })).toEqual([
      "MyProject.ClientRedirectUriLimit",
    ]);
    expect(found({ search: "clientName" })).toEqual([]);
  });

  it("needs every word, in any order", () => {
    expect(found({ search: "start client id" })).toEqual([
      "ClientIdMustStartWith",
    ]);
    expect(found({ search: "client scope" })).toEqual([]);
  });

  it("combines the resource type and the status with the search", () => {
    expect(found({ resourceTypes: ["ApiScope"] })).toEqual([
      "ApiScopeMustHaveDisplayName",
    ]);
    expect(found({ statuses: ["enabled"] })).toEqual([
      "MissingPkce",
      "MyProject.ClientRedirectUriLimit",
    ]);
    expect(
      found({
        search: "client",
        resourceTypes: ["Client"],
        statuses: ["disabled"],
      }),
    ).toEqual(["ClientIdMustStartWith"]);
    expect(found({ statuses: ["enabled", "disabled"] })).toHaveLength(
      rules.length,
    );
  });
});

describe("parseRuleFilters", () => {
  it("reads the filters from the query string", () => {
    const filters = parseRuleFilters(
      new URLSearchParams(
        "search=pkce&resource=ApiScope&resource=Client&status=enabled",
      ),
    );

    expect(filters).toEqual({
      search: "pkce",
      resourceTypes: ["Client", "ApiScope"],
      statuses: ["enabled"],
    });
    expect(hasRuleFilters(filters)).toBe(true);
  });

  it("ignores a value the list does not know", () => {
    const filters = parseRuleFilters(
      new URLSearchParams("resource=Tenant&status=archived"),
    );

    expect(filters).toEqual(noFilters);
    expect(hasRuleFilters(filters)).toBe(false);
  });
});
