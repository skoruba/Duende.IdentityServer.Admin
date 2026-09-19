export type IssueLike = {
  resourceId: number;
  resourceType: string;
  issueType: string;
  message?: string;
};

export type IssueSeverity = "Error" | "Warning" | "Recommendation";

export type IssueGroup = {
  message: string;
  severity: IssueSeverity;
  resourceType: string;
  /** Distinct resources affected by this problem. */
  resources: number;
};

export type ResourceAttention = {
  /** Distinct resources with at least one error or warning. */
  resources: number;
  hasErrors: boolean;
};

const SEVERITY_ORDER: Record<string, number> = {
  Error: 0,
  Warning: 1,
  Recommendation: 2,
};

/**
 * Collapses issues into "the same problem on N resources", most urgent first:
 * errors before warnings before recommendations, then by affected resources.
 */
export const getTopIssueGroups = (
  issues: IssueLike[],
  limit: number,
): IssueGroup[] => {
  const groups = new Map<string, IssueGroup & { ids: Set<number> }>();

  for (const issue of issues) {
    const message = issue.message?.trim();
    if (!message) continue;

    const key = `${issue.issueType}|${issue.resourceType}|${message}`;
    const group = groups.get(key) ?? {
      message,
      severity: issue.issueType as IssueSeverity,
      resourceType: issue.resourceType,
      resources: 0,
      ids: new Set<number>(),
    };

    group.ids.add(issue.resourceId);
    group.resources = group.ids.size;
    groups.set(key, group);
  }

  return [...groups.values()]
    .sort(
      (a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3) ||
        b.resources - a.resources,
    )
    .slice(0, limit)
    .map(({ message, severity, resourceType, resources }) => ({
      message,
      severity,
      resourceType,
      resources,
    }));
};

/** Per resource type: how many distinct resources have an error or a warning. */
export const getAttentionByResourceType = (
  issues: IssueLike[],
): Record<string, ResourceAttention> => {
  const byType = new Map<string, { ids: Set<number>; hasErrors: boolean }>();

  for (const issue of issues) {
    if (issue.issueType !== "Error" && issue.issueType !== "Warning") continue;

    const entry = byType.get(issue.resourceType) ?? {
      ids: new Set<number>(),
      hasErrors: false,
    };
    entry.ids.add(issue.resourceId);
    entry.hasErrors = entry.hasErrors || issue.issueType === "Error";
    byType.set(issue.resourceType, entry);
  }

  return Object.fromEntries(
    [...byType.entries()].map(([type, entry]) => [
      type,
      { resources: entry.ids.size, hasErrors: entry.hasErrors },
    ]),
  );
};

export type IssueSummaryLike = {
  errors?: number;
  warnings?: number;
  recommendations?: number;
};

/** Every issue counts towards the total shown in badges - errors included. */
export const getIssuesTotal = (summary?: IssueSummaryLike | null): number =>
  (summary?.errors ?? 0) +
  (summary?.warnings ?? 0) +
  (summary?.recommendations ?? 0);

export type IssueSummary = Required<IssueSummaryLike>;

/**
 * The per severity counts, exactly as the GetSummary endpoint reports them - it
 * counts the very same unfiltered issue list on the server.
 */
export const summarizeIssues = (
  issues: Pick<IssueLike, "issueType">[],
): IssueSummary => {
  const summary: IssueSummary = { errors: 0, warnings: 0, recommendations: 0 };

  for (const issue of issues) {
    if (issue.issueType === "Error") summary.errors++;
    else if (issue.issueType === "Warning") summary.warnings++;
    else if (issue.issueType === "Recommendation") summary.recommendations++;
  }

  return summary;
};
