"use client";

import { Award } from "lucide-react";

interface ProgressCircleProps {
  percent: number;
  size?: number;
}

export const ProgressCircle = ({ percent, size = 36 }: ProgressCircleProps) => {
  const stroke = 3;
  const radius = size / 2 - stroke;
  const circumference = radius * 2 * Math.PI;
  const safePercent = Math.max(0, Math.min(100, percent));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
          stroke="color-mix(in_oklab,var(--muted-foreground)_20%,transparent)"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        <circle
          stroke="var(--primary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-300"
        />
      </svg>

      <Award className="absolute h-4 w-4 text-primary" />
    </div>
  );
};
