export type IssueType = "Error" | "Warning" | "Recommendation";

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isSwaggerError = (
  error: unknown
): error is { message?: unknown; status?: unknown; response?: unknown } => {
  return isObject(error);
};

export const isProblemDetails = (
  error: unknown
): error is {
  title?: string;
  detail?: string;
  status?: number;
  type?: string;
  errors?: Record<string, string[] | string>;
} => {
  return (
    isObject(error) &&
    ("title" in error || "detail" in error || "status" in error || "errors" in error)
  );
};

export const isClientProperty = (key: string): key is string => {
  return typeof key === "string" && key.length > 0;
};

export const buildTranslationKey = (prefix: string, key: string): string => {
  if (!prefix || !key) return "";
  return `${prefix}.${key}`;
};

export const isValidIssueType = (value: unknown): value is IssueType => {
  return value === "Error" || value === "Warning" || value === "Recommendation";
};

export const isEnumValue = <TEnum extends Record<string, string | number>>(
  enumObject: TEnum,
  value: unknown
): value is TEnum[keyof TEnum] => {
  const values = Object.values(enumObject) as Array<TEnum[keyof TEnum]>;
  return values.includes(value as TEnum[keyof TEnum]);
};
