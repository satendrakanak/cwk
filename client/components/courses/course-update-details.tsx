"use client";

import { BookA, CalendarDays } from "lucide-react";
import { PiCertificateDuotone } from "react-icons/pi";

interface CourseUpdateDetailsProps {
  lastUpdateDate: string;
  language: string;
  certificate: string;
}

const CourseUpdateDetails = ({
  lastUpdateDate,
  language,
  certificate,
}: CourseUpdateDetailsProps) => {
  const items = [
    {
      icon: CalendarDays,
      label: `Last updated on ${lastUpdateDate}`,
    },
    {
      icon: BookA,
      label: language,
    },
    {
      icon: PiCertificateDuotone,
      label: certificate,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-white/80 backdrop-blur-md"
          >
            <Icon className="h-4 w-4 shrink-0 text-white/85" />
            <span className="whitespace-nowrap">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CourseUpdateDetails;
