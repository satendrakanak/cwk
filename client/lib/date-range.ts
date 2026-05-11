import {
  endOfDay,
  endOfMonth,
  isAfter,
  isBefore,
  isValid,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { formatDate } from "@/utils/formate-date";

export type DateRangePreset =
  | "today"
  | "last-day"
  | "last-7-days"
  | "last-30-days"
  | "this-month"
  | "last-month"
  | "all-time"
  | "custom";

export type DateRangeValue = {
  preset: DateRangePreset;
  from: Date | null;
  to: Date | null;
};

export const DATE_RANGE_PRESETS: Array<{
  key: DateRangePreset;
  label: string;
}> = [
  { key: "today", label: "Today" },
  { key: "last-day", label: "Last day" },
  { key: "last-7-days", label: "Last 7 days" },
  { key: "last-30-days", label: "Last 30 days" },
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "all-time", label: "Lifetime" },
  { key: "custom", label: "Custom" },
];

export const DEFAULT_DATE_RANGE_VALUE = getPresetDateRange("last-30-days");

export function getPresetDateRange(preset: DateRangePreset): DateRangeValue {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "today":
      return { preset, from: todayStart, to: todayEnd };
    case "last-day":
      return {
        preset,
        from: startOfDay(subDays(now, 1)),
        to: endOfDay(subDays(now, 1)),
      };
    case "last-7-days":
      return { preset, from: startOfDay(subDays(now, 6)), to: todayEnd };
    case "last-30-days":
      return { preset, from: startOfDay(subDays(now, 29)), to: todayEnd };
    case "this-month":
      return { preset, from: startOfMonth(now), to: todayEnd };
    case "last-month": {
      const previousMonth = subMonths(now, 1);
      return {
        preset,
        from: startOfMonth(previousMonth),
        to: endOfMonth(previousMonth),
      };
    }
    case "all-time":
      return { preset, from: null, to: null };
    case "custom":
    default:
      return { preset: "custom", from: todayStart, to: todayEnd };
  }
}

export function getDateRangeLabel(value: DateRangeValue) {
  const preset = DATE_RANGE_PRESETS.find((item) => item.key === value.preset);

  if (value.preset !== "custom" && preset) {
    return preset.label;
  }

  if (value.from && value.to) {
    return `${formatDate(value.from.toISOString())} - ${formatDate(
      value.to.toISOString(),
    )}`;
  }

  if (value.from) {
    return `${formatDate(value.from.toISOString())} onward`;
  }

  return "Select date range";
}

export function isDateWithinRange(
  dateValue: string | Date | null | undefined,
  range: DateRangeValue,
) {
  if (range.preset === "all-time") {
    return true;
  }

  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  if (!isValid(date)) {
    return false;
  }

  const from = range.from ? startOfDay(range.from) : null;
  const to = range.to ? endOfDay(range.to) : null;

  if (from && isBefore(date, from)) {
    return false;
  }

  if (to && isAfter(date, to)) {
    return false;
  }

  return true;
}

export function getDateRangeFromSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): DateRangeValue {
  const presetParam = readParam(searchParams, "range") as
    | DateRangePreset
    | undefined;
  const preset: DateRangePreset = DATE_RANGE_PRESETS.some(
    (item) => item.key === presetParam,
  )
    ? presetParam!
    : "last-30-days";

  if (preset !== "custom") {
    return getPresetDateRange(preset);
  }

  const from = parseSearchDate(readParam(searchParams, "startDate"));
  const to = parseSearchDate(readParam(searchParams, "endDate"));

  return {
    preset: "custom",
    from: from ? startOfDay(from) : null,
    to: to ? endOfDay(to) : null,
  };
}

export function getServerDateRangeQuery(value: DateRangeValue) {
  if (value.preset === "all-time") {
    return "";
  }

  const params = new URLSearchParams();

  if (value.from) {
    params.set("startDate", value.from.toISOString());
  }

  if (value.to) {
    params.set("endDate", value.to.toISOString());
  }

  return params.toString();
}

export function updateDateRangeSearchParams(
  current: URLSearchParams,
  value: DateRangeValue,
) {
  const params = new URLSearchParams(current.toString());
  params.set("range", value.preset);
  params.delete("startDate");
  params.delete("endDate");
  params.delete("page");

  if (value.preset === "custom") {
    if (value.from) {
      params.set("startDate", value.from.toISOString());
    }

    if (value.to) {
      params.set("endDate", value.to.toISOString());
    }
  }

  return params;
}

function parseSearchDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return isValid(date) ? date : null;
}

function readParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}
