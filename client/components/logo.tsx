"use client";
import Link from "next/link";
import { useSiteSettings } from "@/context/site-settings-context";

const Logo = ({ footer = false }: { footer?: boolean }) => {
  const { site } = useSiteSettings();
  const src = footer
    ? site.footerLogoUrl || site.logoUrl || "/assets/cwk-logo.png"
    : site.logoUrl || "/assets/cwk-logo.png";

  return (
    <Link
      href="/"
      className="flex min-w-0 items-center justify-center md:justify-start"
    >
      <div className="relative h-14 w-40 sm:h-15 sm:w-40 md:h-16 md:w-45">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={site.siteName || "logo"}
          src={src}
          width={250}
          height={60}
          className="h-full w-auto object-contain"
        />
      </div>
    </Link>
  );
};

export default Logo;
