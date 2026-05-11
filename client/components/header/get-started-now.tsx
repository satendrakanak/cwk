"use client";
import { cn } from "@/lib/utils";
import { PhoneCall } from "lucide-react";

interface GetStartedNowProps {
  className?: string;
}

export const GetStartedNow = ({ className }: GetStartedNowProps) => {
  return (
    <>
      <a
        href="tel:+919871100237"
        className={cn(
          "bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md hover:brightness-110 transition duration-200 relative overflow-hidden",
          className,
        )}
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white opacity-25 animate-ping"></span>
          <PhoneCall className="inline w-5 h-5 mr-1 relative z-10" />
          Get Started Now
        </div>
      </a>
    </>
  );
};
