import { describe, expect, it } from "vitest";
import { combineDateTimeForUnspecifiedDb } from "@/helpers/DateTimeHelper";
import { hasUsableJwkSecret, resolveSecretExpiration } from "./clientSecrets";

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

describe("resolveSecretExpiration", () => {
  // What the date picker hands over - local midnight of the picked day. Late
  // evening is the case that used to roll over to the next day east of UTC.
  const pickedDay = () => new Date(2026, 8, 18);
  const wizardState = () => ({
    addExpiration: true,
    expiration: pickedDay(),
    expirationTime: "22:30",
  });

  it("stores the picked local date and time as they were entered", () => {
    const expiration = resolveSecretExpiration(wizardState())!;

    // Read through the UTC getters, so the check holds in any machine time zone.
    expect([
      expiration.getUTCFullYear(),
      expiration.getUTCMonth(),
      expiration.getUTCDate(),
      expiration.getUTCHours(),
      expiration.getUTCMinutes(),
    ]).toEqual([2026, 8, 18, 22, 30]);
  });

  it("matches the single combine the secret step used to do on submit", () => {
    expect(resolveSecretExpiration(wizardState())).toEqual(
      combineDateTimeForUnspecifiedDb(pickedDay(), "22:30"),
    );
  });

  it("gives the same value however many times the wizard state is resolved", () => {
    const state = wizardState();

    const first = resolveSecretExpiration(state);
    // Back and Next again - the step submits the very same raw values.
    const second = resolveSecretExpiration({ ...state });

    expect(second).toEqual(first);
    expect(state.expiration).toEqual(pickedDay());
    expect(state.expirationTime).toBe("22:30");
  });

  it("falls back to midnight without a time", () => {
    const expiration = resolveSecretExpiration({
      ...wizardState(),
      expirationTime: null,
    })!;

    expect([expiration.getUTCDate(), expiration.getUTCHours()]).toEqual([18, 0]);
  });

  it("has no expiration when it is switched off or no date is picked", () => {
    expect(
      resolveSecretExpiration({ ...wizardState(), addExpiration: false }),
    ).toBeNull();
    expect(
      resolveSecretExpiration({ ...wizardState(), expiration: null }),
    ).toBeNull();
    expect(resolveSecretExpiration({})).toBeNull();
  });
});
