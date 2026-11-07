export function getInitialsFromEmail(
  email: string | null | undefined,
  fallbackName?: string | null,
): string {
  const localPart = email?.trim().split("@")[0];
  const source = localPart || fallbackName?.trim();

  const parts = (source ?? "").split(".").filter((part) => part.length > 0);

  if (parts.length === 0) {
    return "?";
  }

  return parts
    .slice(0, 3)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}
