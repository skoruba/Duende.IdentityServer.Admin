import { describe, expect, it } from "vitest";
import {
  countEnabledUnknownRules,
  isRuleTypeInUse,
  isUnknownRuleType,
  resolveRuleType,
} from "./ruleTypeSelection";

const metadata = [
  { ruleType: "MissingPkce" },
  { ruleType: "Contoso.ClientSecretMustExpireWithinOneYear" },
];

describe("resolveRuleType", () => {
  it("accepts a built-in rule type the API lists", () => {
    expect(resolveRuleType(metadata, "MissingPkce")).toBe("MissingPkce");
  });

  it("accepts a custom rule type the API lists", () => {
    expect(
      resolveRuleType(metadata, "Contoso.ClientSecretMustExpireWithinOneYear"),
    ).toBe("Contoso.ClientSecretMustExpireWithinOneYear");
  });

  it("clears a value the API does not list", () => {
    expect(resolveRuleType(metadata, "Contoso.Removed")).toBe("");
    expect(resolveRuleType(undefined, "MissingPkce")).toBe("");
  });
});

describe("isRuleTypeInUse", () => {
  const rules = [{ ruleType: "MissingPkce" }, { ruleType: "Contoso.Rule" }];

  it("finds a rule stored under the type", () => {
    expect(isRuleTypeInUse(rules, "Contoso.Rule")).toBe(true);
  });

  it("is false for a type without a rule and for no selection", () => {
    expect(isRuleTypeInUse(rules, "ScopeIsUnused")).toBe(false);
    expect(isRuleTypeInUse(rules, "")).toBe(false);
  });
});

describe("isUnknownRuleType", () => {
  it("flags a stored rule the metadata does not describe", () => {
    expect(isUnknownRuleType(metadata, "Contoso.Removed")).toBe(true);
  });

  it("does not flag a described rule or a list that is still loading", () => {
    expect(isUnknownRuleType(metadata, "MissingPkce")).toBe(false);
    expect(isUnknownRuleType(undefined, "Contoso.Removed")).toBe(false);
  });
});

describe("countEnabledUnknownRules", () => {
  const rules = [
    { ruleType: "Contoso.Removed", isEnabled: true },
    { ruleType: "Contoso.Renamed", isEnabled: false },
    { ruleType: "MissingPkce", isEnabled: true },
  ];

  it("counts only the enabled rules the metadata does not describe", () => {
    expect(countEnabledUnknownRules(metadata, rules)).toBe(1);
  });

  it("counts nothing while the metadata is still loading", () => {
    expect(countEnabledUnknownRules(undefined, rules)).toBe(0);
  });
});
