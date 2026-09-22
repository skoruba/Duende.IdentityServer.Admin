import { describe, expect, it } from "vitest";
import {
  buildDailySeries,
  getActivityInsight,
  getNiceAxisTicks,
  getPastAnomalies,
} from "./activitySeries";

const day = (d: number, total: number) => ({
  created: new Date(2026, 8, d),
  total,
});

describe("buildDailySeries", () => {
  it("fills days without events with zero up to today", () => {
    const series = buildDailySeries(
      [day(15, 1), day(16, 1), day(18, 2371)],
      new Date(2026, 8, 19, 14, 30),
    );

    expect(series.map((d) => d.created.getDate())).toEqual([15, 16, 17, 18, 19]);
    expect(series.map((d) => d.total)).toEqual([1, 1, 0, 2371, 0]);
  });

  it("returns an empty series for no data", () => {
    expect(buildDailySeries([], new Date(2026, 8, 19))).toEqual([]);
  });
});

describe("getActivityInsight", () => {
  it("flags today against a baseline that excludes today", () => {
    const series = [day(14, 400), day(15, 380), day(16, 420), day(17, 1680)];
    const insight = getActivityInsight(series);

    expect(insight.baseline).toBe(400);
    expect(insight.threshold).toBe(600);
    expect(insight.isUnusual).toBe(true);
  });

  it("keeps idle days out of the baseline", () => {
    const series = [day(12, 400), day(13, 0), day(14, 0), day(15, 400), day(16, 500)];
    const insight = getActivityInsight(series);

    expect(insight.baseline).toBe(400);
    expect(insight.isUnusual).toBe(false);
  });

  it("does not raise an alert for noise on a nearly idle system", () => {
    const insight = getActivityInsight([day(15, 1), day(16, 1), day(17, 9)]);
    expect(insight.threshold).toBe(50);
    expect(insight.isUnusual).toBe(false);
  });

  it("flags a real spike even when the baseline is tiny", () => {
    const insight = getActivityInsight([day(15, 1), day(16, 1), day(17, 2440)]);
    expect(insight.baseline).toBe(1);
    expect(insight.isUnusual).toBe(true);
  });

});

describe("getNiceAxisTicks", () => {
  it("rounds the maximum up to a readable value with a midpoint", () => {
    expect(getNiceAxisTicks(1940)).toEqual([0, 1000, 2000]);
    expect(getNiceAxisTicks(430)).toEqual([0, 225, 450]);
    expect(getNiceAxisTicks(0)).toEqual([0, 1]);
  });
});

describe("getPastAnomalies", () => {
  it("returns past days above the threshold, newest first, without today", () => {
    const series = [day(14, 900), day(15, 10), day(16, 2500), day(17, 5000)];

    expect(getPastAnomalies(series, 800).map((d) => d.created.getDate())).toEqual([
      16, 14,
    ]);
  });

  it("returns nothing on a calm history", () => {
    expect(getPastAnomalies([day(15, 10), day(16, 12), day(17, 900)], 50)).toEqual([]);
  });
});
