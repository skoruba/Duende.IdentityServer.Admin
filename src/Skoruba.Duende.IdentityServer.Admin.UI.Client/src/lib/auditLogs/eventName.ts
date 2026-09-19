// C# spells acronyms as words ("ApiResource", "JwkSecret"); the UI writes them
// in capitals everywhere else.
const ACRONYMS: Record<string, string> = {
  api: "API",
  jwk: "JWK",
  url: "URL",
  uri: "URI",
  id: "ID",
};

// "ClientSecretAddedEvent" -> "Client secret added"
// "ApiResourceUpdatedEvent" -> "API resource updated"
export const humanizeEventName = (event?: string) => {
  if (!event) return "";

  const words = event
    .replace(/Event$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(" ");

  return words
    .map(
      (word, index) =>
        ACRONYMS[word.toLowerCase()] ??
        (index === 0 || /^[A-Z0-9]+$/.test(word) ? word : word.toLowerCase()),
    )
    .join(" ");
};
