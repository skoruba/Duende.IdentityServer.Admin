export function getInitialsFromEmail(email: string): string {
  const localPart = email.split("@")[0];
  const parts = localPart.split(".");

  let initials: string;

  if (parts.length === 1) {
    initials = parts[0].charAt(0).toUpperCase();
  } else {
    initials = parts
      .slice(0, 3)
      .map((p) => p.charAt(0).toUpperCase())
      .join("");
  }

  return initials;
}
