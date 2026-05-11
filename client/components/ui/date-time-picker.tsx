"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/utils/formate-date";

export const DateRangeTimePicker = ({
  value,
  onChange,
}: {
  value: { from: Date | null; to: Date | null };
  onChange: (val: { from: Date | null; to: Date | null }) => void;
}) => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: value.from ?? undefined,
    to: value.to ?? undefined,
  });

  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");

  const handleSelect = (r: DateRange | undefined) => {
    setRange(r);

    if (!r?.from) return;

    const from = new Date(r.from);
    const to = r.to ? new Date(r.to) : null;

    if (from) {
      const [h, m] = fromTime.split(":").map(Number);
      from.setHours(h, m);
    }

    if (to) {
      const [h, m] = toTime.split(":").map(Number);
      to.setHours(h, m);
    }

    onChange({
      from,
      to,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {range?.from
            ? range.to
              ? `${formatDate(range.from.toISOString())} - ${formatDate(
                  range.to.toISOString(),
                )}`
              : formatDate(range.from.toISOString())
            : "Pick date range"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3 space-y-4">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={{ before: new Date() }} // 🔥 past disable
        />

        {/* Time Controls */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs">From Time</label>
            <Input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="text-xs">To Time</label>
            <Input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
