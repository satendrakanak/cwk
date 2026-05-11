"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { endOfDay, startOfDay } from "date-fns";
import { CalendarDays, Check, ChevronDown, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DATE_RANGE_PRESETS,
  DEFAULT_DATE_RANGE_VALUE,
  DateRangePreset,
  DateRangeValue,
  getDateRangeLabel,
  getPresetDateRange,
} from "@/lib/date-range";
import { cn } from "@/lib/utils";

type DateRangeFilterProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
  align?: "start" | "center" | "end";
};

export function DateRangeFilter({
  value,
  onChange,
  className,
  align = "end",
}: DateRangeFilterProps) {
  const isMountedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState<DateRangeValue>(value);
  const calendarRange = useMemo<DateRange | undefined>(
    () => ({
      from: draftValue.from || undefined,
      to: draftValue.to || undefined,
    }),
    [draftValue.from, draftValue.to],
  );

  const label = getDateRangeLabel(value);
  const draftLabel = getDateRangeLabel(draftValue);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (open && isMountedRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftValue(value);
    }
  }, [open, value]);

  function handlePresetChange(preset: DateRangePreset) {
    if (!isMountedRef.current) return;

    if (preset === "custom") {
      setDraftValue({
        preset,
        from: draftValue.from || startOfDay(new Date()),
        to: draftValue.to || endOfDay(new Date()),
      });
      return;
    }

    setDraftValue(getPresetDateRange(preset));
  }

  function handleCalendarChange(range: DateRange | undefined) {
    if (!isMountedRef.current) return;

    setDraftValue({
      preset: "custom",
      from: range?.from ? startOfDay(range.from) : null,
      to: range?.to
        ? endOfDay(range.to)
        : range?.from
          ? endOfDay(range.from)
          : null,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!isMountedRef.current) return;

    setOpen(nextOpen);
  }

  function handleApply() {
    if (!isMountedRef.current) return;

    setOpen(false);
    onChange(draftValue);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="default"
          className={cn(
            "h-8 w-full justify-between rounded-2xl border-border bg-card px-3 text-left shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto sm:min-w-[230px]",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-sm font-semibold">{label}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-[min(calc(100vw-2rem),760px)] gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-2xl"
      >
        <div className="grid max-h-[min(76vh,620px)] overflow-y-auto bg-card md:grid-cols-[220px_1fr]">
          <div className="border-b border-border bg-muted/45 p-2 md:border-b-0 md:border-r">
            <div className="space-y-1">
              {DATE_RANGE_PRESETS.map((preset) => {
                const isActive = draftValue.preset === preset.key;

                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePresetChange(preset.key)}
                    className={cn(
                      "flex h-9 w-full items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background hover:text-foreground",
                    )}
                  >
                    <span>{preset.label}</span>
                    {isActive ? <Check className="h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 p-3">
            <div className="flex flex-col gap-1 border-b border-border pb-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Date Range
              </p>
              <p className="text-sm font-semibold text-card-foreground">
                {draftLabel}
              </p>
            </div>

            <Calendar
              mode="range"
              selected={calendarRange}
              onSelect={handleCalendarChange}
              numberOfMonths={2}
              className="mx-auto"
              disabled={{ after: new Date() }}
            />

            <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDraftValue(DEFAULT_DATE_RANGE_VALUE)}
                className="justify-start"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>

              <Button type="button" size="sm" onClick={handleApply}>
                Apply range
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
