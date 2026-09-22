import { describe, expect, it } from "vitest";
import {
  getAttentionByResourceType,
  getIssuesTotal,
  getTopIssueGroups,
  IssueLike,
  summarizeIssues,
} from "./issueInsights";

const issue = (
  resourceId: number,
  resourceType: string,
  issueType: string,
  message: string,
): IssueLike => ({ resourceId, resourceType, issueType, message });

const issues: IssueLike[] = [
  issue(1, "Client", "Warning", "Missing PKCE"),
  issue(2, "Client", "Warning", "Missing PKCE"),
  issue(3, "Client", "Warning", "Missing PKCE"),
  issue(1, "Client", "Error", "Secret expired"),
  issue(1, "Client", "Error", "Secret expired"),
  issue(7, "ApiScope", "Recommendation", "Add a display name"),
];

describe("getTopIssueGroups", () => {
  it("puts errors first even when a warning affects more resources", () => {
    const [first, second] = getTopIssueGroups(issues, 2);
    expect(first).toMatchObject({ message: "Secret expired", severity: "Error" });
    expect(second).toMatchObject({ message: "Missing PKCE", resources: 3 });
  });

  it("counts a resource once per problem", () => {
    expect(getTopIssueGroups(issues, 1)[0].resources).toBe(1);
  });
});

describe("getAttentionByResourceType", () => {
  it("counts distinct resources and ignores recommendations", () => {
    const attention = getAttentionByResourceType(issues);
    expect(attention.Client).toEqual({ resources: 3, hasErrors: true });
    expect(attention.ApiScope).toBeUndefined();
  });
});

describe("getIssuesTotal", () => {
  it("adds up every severity, errors included", () => {
    expect(getIssuesTotal({ errors: 16, warnings: 7, recommendations: 8 })).toBe(31);
  });

  it("treats missing data as zero", () => {
    expect(getIssuesTotal(undefined)).toBe(0);
    expect(getIssuesTotal({ warnings: 2 })).toBe(2);
  });
});

describe("summarizeIssues", () => {
  it("counts every issue by its severity, like the summary endpoint", () => {
    expect(summarizeIssues(issues)).toEqual({
      errors: 2,
      warnings: 3,
      recommendations: 1,
    });
  });

  it("reports zeros for an empty list", () => {
    expect(summarizeIssues([])).toEqual({
      errors: 0,
      warnings: 0,
      recommendations: 0,
    });
  });

  it("adds up to the badge total", () => {
    expect(getIssuesTotal(summarizeIssues(issues))).toBe(issues.length);
  });
});
