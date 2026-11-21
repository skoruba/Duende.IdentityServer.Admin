export type RuleTypeMetadataLike = {
  ruleType?: string;
};

export type ExistingRuleLike = {
  ruleType: unknown;
};

/**
 * The rule types a deployment offers are whatever the Admin API lists in its metadata:
 * the built-in rules and the ones registered with `AddConfigurationRule`. A value that is
 * not listed cannot be created, so the selection is cleared.
 */
export const resolveRuleType = (
  metadata: RuleTypeMetadataLike[] | undefined,
  value: string,
): string =>
  metadata?.some((item) => String(item.ruleType) === value) ? value : "";

/** Each rule type can be configured once. */
export const isRuleTypeInUse = (
  existingRules: ExistingRuleLike[],
  ruleType: string,
): boolean =>
  ruleType !== "" &&
  existingRules.some((rule) => String(rule.ruleType) === ruleType);

/** A stored rule no registered rule describes - its implementation was removed. */
export const isUnknownRuleType = (
  metadata: RuleTypeMetadataLike[] | undefined,
  ruleType: unknown,
): boolean =>
  metadata !== undefined &&
  !metadata.some((item) => String(item.ruleType) === String(ruleType));

/** Only an enabled rule calls for action; a disabled one is never run anyway. */
export const countEnabledUnknownRules = (
  metadata: RuleTypeMetadataLike[] | undefined,
  rules: (ExistingRuleLike & { isEnabled?: boolean })[],
): number =>
  rules.filter(
    (rule) => rule.isEnabled && isUnknownRuleType(metadata, rule.ruleType),
  ).length;
