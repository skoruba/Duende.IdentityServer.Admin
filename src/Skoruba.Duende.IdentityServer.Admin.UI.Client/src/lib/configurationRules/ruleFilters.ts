import { RuleLike, RuleMetadataLike, summarizeRule } from "./summarizeRule";

/** In the order the list is sorted by. */
export const RULE_RESOURCE_TYPES = [
  "Client",
  "IdentityResource",
  "ApiResource",
  "ApiScope",
] as const;

export const RULE_STATUSES = ["enabled", "disabled"] as const;

export type RuleResourceType = (typeof RULE_RESOURCE_TYPES)[number];

export type RuleStatus = (typeof RULE_STATUSES)[number];

export type RuleFilters = {
  search: string;
  resourceTypes: RuleResourceType[];
  statuses: RuleStatus[];
};

export type FilterableRule = RuleLike & {
  resourceType?: unknown;
  isEnabled?: boolean;
};

export const SEARCH_PARAM = "search";
export const RESOURCE_TYPE_PARAM = "resource";
export const STATUS_PARAM = "status";

/** Reads `?search=pkce&resource=Client&status=enabled`; a value the list does not know is ignored. */
export const parseRuleFilters = (params: URLSearchParams): RuleFilters => ({
  search: params.get(SEARCH_PARAM) ?? "",
  resourceTypes: RULE_RESOURCE_TYPES.filter((type) =>
    params.getAll(RESOURCE_TYPE_PARAM).includes(type),
  ),
  statuses: RULE_STATUSES.filter((status) =>
    params.getAll(STATUS_PARAM).includes(status),
  ),
});

export const hasRuleFilters = (filters: RuleFilters): boolean =>
  filters.search.trim() !== "" ||
  filters.resourceTypes.length > 0 ||
  filters.statuses.length > 0;

/**
 * The search goes through what a row of the list shows - the name, the description,
 * the labels and values of the parameters - and the key of the rule. Every word has
 * to be found, in any order and letter case.
 */
export const filterRules = <T extends FilterableRule>(
  rules: T[],
  metadata: RuleMetadataLike[] | undefined,
  filters: RuleFilters,
  formatBoolean: (value: boolean) => string,
): T[] => {
  const words = filters.search.toLowerCase().split(/\s+/).filter(Boolean);

  return rules.filter((rule) => {
    if (
      filters.resourceTypes.length > 0 &&
      !filters.resourceTypes.some((type) => type === String(rule.resourceType))
    ) {
      return false;
    }

    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(rule.isEnabled ? "enabled" : "disabled")
    ) {
      return false;
    }

    if (words.length === 0) {
      return true;
    }

    const summary = summarizeRule(rule, metadata, formatBoolean);
    const text = [
      summary.name,
      summary.description,
      String(rule.ruleType),
      ...summary.parameters.flatMap((parameter) => [
        parameter.label,
        ...parameter.values,
      ]),
    ]
      .join(" ")
      .toLowerCase();

    return words.every((word) => text.includes(word));
  });
};
