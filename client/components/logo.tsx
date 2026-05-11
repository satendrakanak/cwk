"use client";
import Link from "next/link";
import { useSiteSettings } from "@/context/site-settings-context";

const defaultLogoSources = new Set([
  "/assets/cwk-logo.png",
  "/assets/cwk-logo-light.png",
  "/assets/cwk-logo-dark.png",
]);

const Logo = ({ footer = false }: { footer?: boolean }) => {
  const { site } = useSiteSettings();
  const src = footer
    ? site.footerLogoUrl || site.logoUrl || "/assets/cwk-logo.png"
    : site.logoUrl || "/assets/cwk-logo.png";
  const useDefaultThemeLogo = defaultLogoSources.has(src);

  return (
    <Link
      href="/"
      className="flex min-w-0 items-center justify-center md:justify-start"
    >
      <div className="relative h-12 w-[210px] sm:h-14 sm:w-[240px] md:h-15 md:w-[260px]">
        {useDefaultThemeLogo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={site.siteName || "CodeWithKasa"}
              src="/assets/cwk-logo-light.png"
              width={900}
              height={222}
              className="h-full w-auto object-contain dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={site.siteName || "CodeWithKasa"}
              src="/assets/cwk-logo-dark.png"
              width={900}
              height={222}
              className="hidden h-full w-auto object-contain dark:block"
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={site.siteName || "logo"}
            src={src}
            width={900}
            height={222}
            className="h-full w-auto object-contain"
          />
        )}
      </div>
    </Link>
  );
};

export default Logo;
