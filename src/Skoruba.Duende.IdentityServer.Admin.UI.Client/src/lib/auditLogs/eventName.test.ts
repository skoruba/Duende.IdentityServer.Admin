import { describe, expect, it } from "vitest";
import { humanizeEventName } from "./eventName";

describe("humanizeEventName", () => {
  it("drops the Event suffix and splits words", () => {
    expect(humanizeEventName("ClientSecretAddedEvent")).toBe(
      "Client secret added",
    );
  });

  it("capitalizes acronyms that C# spells as words", () => {
    expect(humanizeEventName("ApiResourceUpdatedEvent")).toBe(
      "API resource updated",
    );
    expect(humanizeEventName("ClientJwkSecretAddedEvent")).toBe(
      "Client JWK secret added",
    );
    // "Identity" merely starts with "Id" and must stay a word.
    expect(humanizeEventName("IdentityProviderAddedEvent")).toBe(
      "Identity provider added",
    );
  });

  it("keeps acronyms intact", () => {
    expect(humanizeEventName("APIResourceUpdatedEvent")).toBe(
      "API resource updated",
    );
  });

  it("handles names without the suffix and empty values", () => {
    expect(humanizeEventName("UserDeleted")).toBe("User deleted");
    expect(humanizeEventName(undefined)).toBe("");
  });
});
