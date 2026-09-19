import { describe, expect, it } from "vitest";
import { findRuleTypeForIssueGroup, RuleLike } from "./matchRule";

const rule = (
  ruleType: string,
  messageTemplate: string,
  overrides: Partial<RuleLike> = {},
): RuleLike => ({
  ruleType,
  resourceType: "Client",
  issueType: "Error",
  isEnabled: true,
  messageTemplate,
  ...overrides,
});

const rules: RuleLike[] = [
  rule("MissingPkce", "Client does not require PKCE"),
  rule(
    "ClientAccessTokenLifetimeTooLong",
    "Token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
  ),
  rule("ObsoleteImplicitGrant", "Client does not require PKCE", {
    isEnabled: false,
  }),
  rule("ApiScopeMustHaveDisplayName", "Client does not require PKCE", {
    resourceType: "ApiScope",
  }),
];

const group = (message: string) => ({
  message,
  severity: "Error",
  resourceType: "Client",
});

describe("findRuleTypeForIssueGroup", () => {
  it("matches a plain template exactly within severity and resource type", () => {
    expect(
      findRuleTypeForIssueGroup(group("Client does not require PKCE"), rules),
    ).toBe("MissingPkce");
  });

  it("matches a message produced from a template with placeholders", () => {
    expect(
      findRuleTypeForIssueGroup(
        group("Token lifetime 3600s exceeds maximum 300s"),
        rules,
      ),
    ).toBe("ClientAccessTokenLifetimeTooLong");
  });

  it("gives up instead of guessing", () => {
    expect(findRuleTypeForIssueGroup(group("Something else"), rules)).toBeUndefined();

    const ambiguous = [...rules, rule("ClientMustHaveScopes", "Client does not require PKCE")];
    expect(
      findRuleTypeForIssueGroup(group("Client does not require PKCE"), ambiguous),
    ).toBeUndefined();
  });
});
