import { describe, expect, it } from "vitest";
import {
  formatDateTimeParam,
  parseDateTimeParam,
  toTimeRange,
} from "./errorLogFilters";

const day = new Date(2026, 10, 9);

describe("toTimeRange", () => {
  it("takes the picked minutes, the to minute as a whole", () => {
    const range = toTimeRange(
      { date: day, time: "09:30" },
      { date: day, time: "09:45" },
    );

    expect(range.from).toEqual(new Date(2026, 10, 9, 9, 30));
    expect(range.to).toEqual(new Date(2026, 10, 9, 9, 46));
  });

  it("takes whole days without a time", () => {
    const range = toTimeRange({ date: day }, { date: day });

    expect(range.from).toEqual(new Date(2026, 10, 9, 0, 0));
    expect(range.to).toEqual(new Date(2026, 10, 10, 0, 0));
  });

  it("leaves a bound without a date open", () => {
    expect(toTimeRange({}, { date: day, time: "23:59" })).toEqual({
      from: undefined,
      to: new Date(2026, 10, 10, 0, 0),
    });
    expect(toTimeRange({ time: "09:30" }, {})).toEqual({
      from: undefined,
      to: undefined,
    });
  });
});

describe("date time params", () => {
  it("round-trips a day and a day with a time", () => {
    expect(formatDateTimeParam({ date: day })).toBe("2026-11-09");
    expect(formatDateTimeParam({ date: day, time: "09:30" })).toBe(
      "2026-11-09T09:30",
    );
    expect(parseDateTimeParam("2026-11-09T09:30")).toEqual({
      date: day,
      time: "09:30",
    });
    expect(parseDateTimeParam("2026-11-09")).toEqual({
      date: day,
      time: undefined,
    });
  });

  it("ignores a broken value", () => {
    expect(parseDateTimeParam(null)).toEqual({});
    expect(parseDateTimeParam("yesterday")).toEqual({});
    expect(parseDateTimeParam("2026-11-09T25:00")).toEqual({
      date: day,
      time: undefined,
    });
  });
});
