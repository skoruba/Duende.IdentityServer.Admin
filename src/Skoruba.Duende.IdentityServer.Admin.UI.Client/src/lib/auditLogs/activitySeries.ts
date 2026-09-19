export type DailyActivity = { created: Date; total: number };

const DAY_MS = 24 * 60 * 60 * 1000;
const UNUSUAL_FACTOR = 1.5;
// On a nearly idle system 3 events vs. 1 is noise, not an anomaly: the
// threshold never drops below this many operations a day.
const MIN_THRESHOLD = 50;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/**
 * Continuous day-by-day series from the first recorded day up to today.
 * The API only returns days that have events; days without any get 0 so the
 * chart shows real gaps instead of connecting distant points.
 */
export const buildDailySeries = (
  data: DailyActivity[],
  today: Date = new Date(),
): DailyActivity[] => {
  if (data.length === 0) return [];

  const totals = new Map(
    data.map((item) => [dayKey(new Date(item.created)), item.total]),
  );
  const first = startOfDay(
    new Date(Math.min(...data.map((item) => new Date(item.created).getTime()))),
  );
  const last = startOfDay(today);

  const series: DailyActivity[] = [];
  // Round to absorb the 23/25 hour days around DST changes.
  const days = Math.round((last.getTime() - first.getTime()) / DAY_MS);
  for (let offset = 0; offset <= days; offset++) {
    const created = new Date(
      first.getFullYear(),
      first.getMonth(),
      first.getDate() + offset,
    );
    series.push({ created, total: totals.get(dayKey(created)) ?? 0 });
  }

  return series;
};

export type ActivityInsight = {
  today: number;
  /**
   * Mean of the active days before today. Today is excluded so a spike cannot
   * hide itself, and idle days (weekends) are excluded so they do not drag the
   * baseline under a normal working day - same as the API's daily average.
   */
  baseline: number;
  /**
   * Level above which a day counts as unusual. The single source of truth:
   * the chart draws this line and the status flips exactly when today crosses it.
   */
  threshold: number;
  /** today / baseline, or undefined when there is no baseline yet. */
  ratio?: number;
  isUnusual: boolean;
};

export const getActivityInsight = (series: DailyActivity[]): ActivityInsight => {
  const today = series[series.length - 1]?.total ?? 0;
  const previous = series.slice(0, -1).filter((day) => day.total > 0);
  const baseline =
    previous.length > 0
      ? previous.reduce((sum, day) => sum + day.total, 0) / previous.length
      : 0;
  const threshold = Math.max(baseline * UNUSUAL_FACTOR, MIN_THRESHOLD);

  return {
    today,
    baseline,
    threshold,
    ratio: baseline > 0 ? today / baseline : undefined,
    isUnusual: today > threshold,
  };
};

/** Round axis maximum with a midpoint, e.g. 1 940 -> [0, 1000, 2000]. */
export const getNiceAxisTicks = (max: number): number[] => {
  if (max <= 0) return [0, 1];

  const step = Math.pow(10, Math.floor(Math.log10(max))) / 2;
  const niceMax = Math.ceil(max / step) * step;

  return [0, niceMax / 2, niceMax];
};

/**
 * Past days above the alert threshold, newest first. Today is excluded - it is
 * reported by ActivityInsight.isUnusual. Uses the same threshold the chart draws,
 * so a flagged day is always a point above the dashed line.
 */
export const getPastAnomalies = <T extends DailyActivity>(
  series: T[],
  threshold: number,
): T[] =>
  series
    .slice(0, -1)
    .filter((day) => day.total > threshold)
    .reverse();
