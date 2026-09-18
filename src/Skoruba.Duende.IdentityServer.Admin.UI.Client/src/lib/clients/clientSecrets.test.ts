import { describe, expect, it } from "vitest";
import { hasUsableJwkSecret } from "./clientSecrets";

const now = new Date("2026-09-18T12:00:00Z");
const yesterday = new Date("2026-09-17T12:00:00Z");
const tomorrow = new Date("2026-09-19T12:00:00Z");

describe("hasUsableJwkSecret", () => {
  it("finds a JWK secret that never expires", () => {
    expect(hasUsableJwkSecret([{ type: "JWK" }], now)).toBe(true);
  });

  it("finds a JWK secret that has not expired yet", () => {
    expect(hasUsableJwkSecret([{ type: "JWK", expiration: tomorrow }], now)).toBe(
      true,
    );
  });

  it("ignores an expired JWK secret, so a valid shared secret stays the default", () => {
    const secrets = [
      { type: "JWK", expiration: yesterday },
      { type: "SharedSecret" },
    ];

    expect(hasUsableJwkSecret(secrets, now)).toBe(false);
  });

  it("is satisfied by one usable JWK secret among expired ones", () => {
    const secrets = [
      { type: "JWK", expiration: yesterday },
      { type: "JWK", expiration: tomorrow },
    ];

    expect(hasUsableJwkSecret(secrets, now)).toBe(true);
  });

  it("does not take other secret types for a JWK", () => {
    expect(
      hasUsableJwkSecret([{ type: "SharedSecret" }, { type: "X509Thumbprint" }], now),
    ).toBe(false);
    expect(hasUsableJwkSecret([], now)).toBe(false);
  });

  it("copes with an expiration that arrives as an ISO string", () => {
    const expired = { type: "JWK", expiration: yesterday.toISOString() as unknown as Date };

    expect(hasUsableJwkSecret([expired], now)).toBe(false);
  });
});
