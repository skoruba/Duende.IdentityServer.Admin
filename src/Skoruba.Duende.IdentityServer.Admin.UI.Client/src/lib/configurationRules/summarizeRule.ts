import { humanizePascalCase } from "@/helpers/StringHelper";

export type RuleLike = {
  ruleType: string;
  configuration?: string;
  messageTemplate?: string;
};

export type RuleParameterMetadataLike = {
  name?: string;
  displayName?: string;
  type?: string;
  defaultValue?: unknown;
};

export type RuleMetadataLike = {
  ruleType?: string;
  displayName?: string;
  description?: string;
  parameters?: RuleParameterMetadataLike[];
};

export type RuleSummaryParameter = {
  label: string;
  /** One entry per value: array parameters list each item on its own. */
  values: string[];
};

export type RuleSummary = {
  name: string;
  description?: string;
  parameters: RuleSummaryParameter[];
};

const parseConfiguration = (
  configuration?: string,
): Record<string, unknown> => {
  if (!configuration) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(configuration);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const formatValues = (
  value: unknown,
  formatBoolean: (value: boolean) => string,
): string[] => {
  if (value === undefined || value === null || value === "") {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined && item !== null && item !== "")
      .map(String);
  }
  if (typeof value === "boolean") {
    return [formatBoolean(value)];
  }

  return [String(value)];
};

/**
 * What the rules list shows for a rule: the name and description from the rule
 * metadata, and the values it checks against. A parameter missing from the stored
 * configuration shows its default, which is the value the rule validator falls
 * back to. A rule the metadata does not know keeps its humanized type and its
 * message template.
 */
export const summarizeRule = (
  rule: RuleLike,
  metadata: RuleMetadataLike[] | undefined,
  formatBoolean: (value: boolean) => string,
): RuleSummary => {
  const meta = metadata?.find(
    (item) => String(item.ruleType) === String(rule.ruleType),
  );

  if (!meta) {
    return {
      name: humanizePascalCase(String(rule.ruleType)),
      description: rule.messageTemplate,
      parameters: [],
    };
  }

  const configuration = parseConfiguration(rule.configuration);
  const parameters = (meta.parameters ?? []).flatMap((parameter) => {
    const name = parameter.name ?? "";
    const value =
      name in configuration ? configuration[name] : parameter.defaultValue;
    const values = formatValues(value, formatBoolean);

    return values.length > 0
      ? [{ label: parameter.displayName || humanizePascalCase(name), values }]
      : [];
  });

  return {
    name: meta.displayName || humanizePascalCase(String(rule.ruleType)),
    description: meta.description || rule.messageTemplate,
    parameters,
  };
};
