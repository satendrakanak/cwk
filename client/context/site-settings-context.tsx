"use client";

import { createContext, useContext } from "react";
import { PublicSettingsBundle } from "@/types/settings";

const defaultBundle: PublicSettingsBundle = {
  site: {
    siteName: "CodeWithKasa",
    siteTagline: "Coding tutorials for you",
    siteDescription:
      "Practical coding education for learners who want clarity, mentorship, and real-world application.",
    logoUrl: "/assets/cwk-logo-light.png",
    footerLogoUrl: "/assets/cwk-logo-light.png",
    faviconUrl: "/favicon.png",
    adminPanelName: "CWK",
    adminPanelIconUrl: "/assets/cwk-mark-light.png",
    supportEmail: "info@codewithkasa.com",
    supportPhone: "+91-9809-XXXXXX",
    supportAddress: "India",
    footerAbout:
      "Practical coding education for learners who want clarity, mentorship, and real-world application.",
    footerCopyright: `© ${new Date().getFullYear()} CodeWithKasa. All Rights Reserved`,
    footerCtaEyebrow: "Start Your Learning Journey",
    footerCtaHeading:
      "Build practical coding expertise with a learning system that actually supports you.",
    footerCtaDescription:
      "Explore guided programs, thoughtful faculty, and a curriculum designed to help you learn clearly and apply with confidence.",
    footerPrimaryCtaLabel: "Explore Courses",
    footerPrimaryCtaHref: "/courses",
    footerSecondaryCtaLabel: "Talk to Us",
    footerSecondaryCtaHref: "/contact",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
  },
  socialProviders: [],
};

const SiteSettingsContext = createContext<PublicSettingsBundle>(defaultBundle);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: PublicSettingsBundle;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
