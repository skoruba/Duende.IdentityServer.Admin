import { describe, expect, it } from "vitest";
import {
  combineDateTimeKeepingStored,
  getDateAndTime,
} from "./DateTimeHelper";

describe("combineDateTimeKeepingStored", () => {
  const stored = new Date(2099, 0, 2, 3, 4, 5, 678);

  it("keeps the stored value while the inputs still show it", () => {
    const { date, time } = getDateAndTime(stored);

    expect(combineDateTimeKeepingStored(stored, date, time)).toBe(stored);
  });

  it("takes the inputs once the time changed", () => {
    const { date } = getDateAndTime(stored);

    expect(combineDateTimeKeepingStored(stored, date, "04:05")).toEqual(
      new Date(2099, 0, 2, 4, 5, 0, 0),
    );
  });

  it("takes the inputs once the date changed", () => {
    const { time } = getDateAndTime(stored);

    expect(
      combineDateTimeKeepingStored(stored, new Date(2099, 0, 3), time),
    ).toEqual(new Date(2099, 0, 3, 3, 4, 0, 0));
  });

  it("clears the value with the date", () => {
    expect(combineDateTimeKeepingStored(stored, null, null)).toBeNull();
  });

  it("combines the inputs when nothing was stored", () => {
    expect(
      combineDateTimeKeepingStored(null, new Date(2099, 0, 3), "05:06"),
    ).toEqual(new Date(2099, 0, 3, 5, 6, 0, 0));
  });
});
