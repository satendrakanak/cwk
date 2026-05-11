const APP_TIME_ZONE = "Asia/Kolkata";
const APP_TIME_ZONE_OFFSET_MINUTES = 330;

export type DatedLifecycle = "active" | "upcoming" | "recent" | "draft" | "cancelled";

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // false karoge toh 24h format
    timeZone: APP_TIME_ZONE,
  }).formatToParts(new Date(date));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = get("day");
  const month = get("month");
  const year = get("year");
  const hour = normalizeTwelveHour(get("hour"));
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toLowerCase();

  const formatted = `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;

  return formatted;
}

export function formatDateTimeInput(value?: string | Date | null) {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: APP_TIME_ZONE,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function parseDateTimeInputToIso(value: string) {
  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) {
    return new Date(value).toISOString();
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  if (
    [year, month, day, hour, minute].some(
      (part) => !Number.isFinite(part),
    )
  ) {
    return new Date(value).toISOString();
  }

  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute) -
    APP_TIME_ZONE_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcMs).toISOString();
}

export function formatTime(date: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: APP_TIME_ZONE,
  }).formatToParts(new Date(date));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${normalizeTwelveHour(get("hour"))}:${get("minute")} ${get("dayPeriod").toLowerCase()}`;
}

export function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function getTodayDateKey() {
  return getDateKey(new Date());
}

export function getDateKey(value: Date | string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function getDateOnlyKey(value?: string | Date | null) {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  return getDateKey(value);
}

export function parseDateKey(value?: string | null, fallback = "1970-01-01") {
  const dateKey = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getDatedLifecycle(
  item: {
    status?: string | null;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
  },
  todayKey: string,
): DatedLifecycle {
  if (item.status === "cancelled") return "cancelled";
  if (item.status === "completed") return "recent";
  if (item.status === "draft") return "draft";

  const start = getDateOnlyKey(item.startDate);
  const end = getDateOnlyKey(item.endDate);

  if (end && end < todayKey) return "recent";
  if (start && start > todayKey) return "upcoming";

  return "active";
}

function normalizeTwelveHour(hour: string) {
  return hour === "00" ? "12" : hour;
}
