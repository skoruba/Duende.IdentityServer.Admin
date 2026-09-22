import { describe, expect, it } from "vitest";
import { formatCompactAge } from "./compactAge";

const now = new Date("2026-09-18T12:00:00Z");
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

describe("formatCompactAge", () => {
  it("picks the largest whole unit", () => {
    expect(formatCompactAge(ago(45), now)).toBe("45s");
    expect(formatCompactAge(ago(12 * 60), now)).toBe("12m");
    expect(formatCompactAge(ago(4 * 3600 + 59 * 60), now)).toBe("4h");
    expect(formatCompactAge(ago(3 * 86400), now)).toBe("3d");
    expect(formatCompactAge(ago(65 * 86400), now)).toBe("2mo");
    expect(formatCompactAge(ago(400 * 86400), now)).toBe("1y");
  });

  it("never returns a negative age for future dates", () => {
    expect(formatCompactAge(ago(-120), now)).toBe("0s");
  });
});
