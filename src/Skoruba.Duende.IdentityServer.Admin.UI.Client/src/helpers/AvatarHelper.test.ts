import { describe, expect, it } from "vitest";
import { getInitialsFromEmail } from "./AvatarHelper";

describe("getInitialsFromEmail", () => {
  it("takes the initials of the local part of the email", () => {
    expect(getInitialsFromEmail("jan.skoruba@example.com")).toBe("JS");
    expect(getInitialsFromEmail("admin@example.com")).toBe("A");
    expect(getInitialsFromEmail("a.b.c.d@example.com")).toBe("ABC");
  });

  it("falls back to the user name when the email is missing", () => {
    expect(getInitialsFromEmail(null, "jan.skoruba")).toBe("JS");
    expect(getInitialsFromEmail(undefined, "admin")).toBe("A");
    expect(getInitialsFromEmail("  ", "admin")).toBe("A");
    expect(getInitialsFromEmail("@example.com", "admin")).toBe("A");
  });

  it("returns a placeholder when there is nothing to take the initials from", () => {
    expect(getInitialsFromEmail(null)).toBe("?");
    expect(getInitialsFromEmail("", "")).toBe("?");
    expect(getInitialsFromEmail("@example.com")).toBe("?");
  });
});
