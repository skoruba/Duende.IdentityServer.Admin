import { addDays, addMinutes, format, isValid, parse, startOfDay } from "date-fns";

export const ERROR_LOG_LEVELS = [
  "Fatal",
  "Error",
  "Warning",
  "Information",
] as const;

export type DateTimeValue = {
  date?: Date;
  /** HH:mm, empty for the whole day */
  time?: string;
};

const DATE_FORMAT = "yyyy-MM-dd";
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// The filters live in the URL as yyyy-MM-dd or yyyy-MM-ddTHH:mm, in the time
// zone of the browser, like the times in the table.
export const parseDateTimeParam = (value: string | null): DateTimeValue => {
  if (!value) {
    return {};
  }

  const [datePart, timePart] = value.split("T");
  const date = parse(datePart, DATE_FORMAT, new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart) || !isValid(date)) {
    return {};
  }

  return {
    date,
    time: timePart && TIME_PATTERN.test(timePart) ? timePart : undefined,
  };
};

export const formatDateTimeParam = ({ date, time }: DateTimeValue) => {
  if (!date) {
    return undefined;
  }

  const day = format(date, DATE_FORMAT);
  return time && TIME_PATTERN.test(time) ? `${day}T${time}` : day;
};

const atTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
  );
};

// The API takes "from" inclusive and "to" exclusive. "From" without a time
// starts the day; "to" includes its whole minute, or the whole day without a
// time, so an event at 09:45:42 is found with "to 09:45".
export const toTimeRange = (from: DateTimeValue, to: DateTimeValue) => ({
  from: from.date
    ? from.time && TIME_PATTERN.test(from.time)
      ? atTime(from.date, from.time)
      : startOfDay(from.date)
    : undefined,
  to: to.date
    ? to.time && TIME_PATTERN.test(to.time)
      ? addMinutes(atTime(to.date, to.time), 1)
      : addDays(startOfDay(to.date), 1)
    : undefined,
});
