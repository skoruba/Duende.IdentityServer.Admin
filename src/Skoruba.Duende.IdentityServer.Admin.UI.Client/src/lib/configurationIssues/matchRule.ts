export type RuleLike = {
  ruleType: string;
  resourceType: string;
  issueType: string;
  isEnabled: boolean;
  messageTemplate: string;
};

export type IssueGroupLike = {
  message: string;
  severity: string;
  resourceType: string;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "Token lifetime {actual}s exceeds {max}s" -> /^Token lifetime .+?s exceeds .+?s$/
const templateToPattern = (template: string) =>
  new RegExp(
    `^${template
      .split(/\{[^{}]+\}/)
      .map(escapeRegExp)
      .join(".+?")}$`,
  );

/**
 * Issues do not carry the rule that produced them, only its formatted message.
 * The rule is recovered by matching the message against the templates of the
 * enabled rules with the same severity and resource type. Returns undefined
 * when nothing (or more than one rule) fits, so callers fall back to the message.
 */
export const findRuleTypeForIssueGroup = (
  group: IssueGroupLike,
  rules: RuleLike[],
): string | undefined => {
  const candidates = rules.filter(
    (rule) =>
      rule.isEnabled &&
      rule.issueType === group.severity &&
      rule.resourceType === group.resourceType,
  );

  const exact = candidates.filter(
    (rule) => rule.messageTemplate === group.message,
  );
  if (exact.length === 1) return exact[0].ruleType;
  if (exact.length > 1) return undefined;

  const matching = candidates.filter(
    (rule) =>
      rule.messageTemplate.includes("{") &&
      templateToPattern(rule.messageTemplate).test(group.message),
  );

  return matching.length === 1 ? matching[0].ruleType : undefined;
};
