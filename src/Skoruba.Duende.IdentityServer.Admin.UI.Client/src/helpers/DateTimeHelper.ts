export const timeZoneDateFormat = "yyyy-MM-dd HH:mm";

export const getDateAndTime = (
  date: Date | null | undefined
): { date: Date | null; time: string | null } => {
  const finalDate = date ? new Date(date) : null;

  let finalTime = null;
  if (finalDate) {
    const hours = finalDate.getHours().toString().padStart(2, "0");
    const minutes = finalDate.getMinutes().toString().padStart(2, "0");
    finalTime = `${hours}:${minutes}`;
  }

  return {
    date: finalDate,
    time: finalTime,
  };
};

export const getNowForUnspecifiedDb = () => {
  const now = new Date();

  const tzOffset = now.getTimezoneOffset();

  return new Date(now.getTime() - tzOffset * 60 * 1000);
};

export const combineDateTimeForUnspecifiedDb = (
  date: Date | null | undefined,
  time: string | null | undefined
) => {
  if (!date) return null;
  const [hours, minutes] = (time || "00:00").split(":").map(Number);

  const local = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );

  const tzOffset = local.getTimezoneOffset();

  return new Date(local.getTime() - tzOffset * 60 * 1000);
};

export const combineDateTime = (
  date: Date | null | undefined,
  time: string | null | undefined
) => {
  if (!date) return null;
  const [hours, minutes] = (time || "00:00").split(":").map(Number);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );
};

export const secondsToFormattedTimeLabels = {
  week: "week",
  weeks: "weeks",
  day: "day",
  days: "days",
  hour: "hour",
  hours: "hours",
  minute: "minute",
  minutes: "minutes",
  second: "second",
  seconds: "seconds",
};

export const secondsToFormattedTime = ({
  seconds,
  labels,
}: {
  seconds: number;
  labels: {
    week: string;
    weeks: string;
    day: string;
    days: string;
    hour: string;
    hours: string;
    minute: string;
    minutes: string;
    second: string;
    seconds: string;
  };
}): string => {
  const SECONDS_IN_MINUTE = 60;
  const SECONDS_IN_HOUR = 3600;
  const SECONDS_IN_DAY = 86400;
  const SECONDS_IN_WEEK = 604800;

  let remainingSeconds = seconds;

  const weeks = Math.floor(remainingSeconds / SECONDS_IN_WEEK);
  remainingSeconds %= SECONDS_IN_WEEK;

  const days = Math.floor(remainingSeconds / SECONDS_IN_DAY);
  remainingSeconds %= SECONDS_IN_DAY;

  const hours = Math.floor(remainingSeconds / SECONDS_IN_HOUR);
  remainingSeconds %= SECONDS_IN_HOUR;

  const minutes = Math.floor(remainingSeconds / SECONDS_IN_MINUTE);
  remainingSeconds %= SECONDS_IN_MINUTE;

  const secs = remainingSeconds;

  const parts = [];
  if (weeks > 0)
    parts.push(`${weeks} ${weeks > 1 ? labels.weeks : labels.week}`);
  if (days > 0) parts.push(`${days} ${days > 1 ? labels.days : labels.day}`);
  if (hours > 0)
    parts.push(`${hours} ${hours > 1 ? labels.hours : labels.hour}`);
  if (minutes > 0)
    parts.push(`${minutes} ${minutes > 1 ? labels.minutes : labels.minute}`);
  if (secs > 0)
    parts.push(`${secs} ${secs > 1 ? labels.seconds : labels.second}`);

  return parts.join(", ");
};
