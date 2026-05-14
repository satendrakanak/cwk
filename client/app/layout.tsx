import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/context/session-context";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { buildMetadata, siteConfig } from "@/lib/seo";
import { settingsServerService } from "@/services/settings/settings.server";
import { SiteSettingsProvider } from "@/context/site-settings-context";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { FloatingThemeToggle } from "@/components/theme/floating-theme-toggle";
import { ScrollProgressButton } from "@/components/ui/scroll-progress-button";
import { RouteProgressBar } from "@/components/ui/route-progress-bar";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { PwaInstallNudge } from "@/components/pwa/pwa-install-nudge";
import { InstallationRedirect } from "@/components/install/installation-redirect";
import { LicenseSessionMonitor } from "@/components/licenses/license-session-monitor";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  display: "swap",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  ...buildMetadata({}),
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const headerList = await headers();
  const hasSession = headerList.get("x-has-session") === "true";
  const publicSettings = (await settingsServerService
    .getPublicSettingsBundle()
    .then((response) => response.data)
    .catch(() => null)) || {
    site: {
      siteName: "CodeWithKasa",
      siteTagline: "Coding tutorials for you",
      siteDescription:
        "Practical coding education for learners who want clarity, mentorship, and real-world application.",
      logoUrl: "/assets/cwk-logo-light.png",
      footerLogoUrl: "/assets/cwk-logo-light.png",
      adminPanelName: "CWK",
      adminPanelIconUrl: "/assets/cwk-mark-light.png",
      faviconUrl: "/favicon.png",
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full font-sans antialiased`}
    >
      <head>
        {publicSettings.site.faviconUrl ? (
          <link rel="icon" href={publicSettings.site.faviconUrl} />
        ) : (
          <link rel="icon" href="/favicon.png" />
        )}
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="CWK" />
        <meta name="application-name" content="CodeWithKasa" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <SiteSettingsProvider value={publicSettings}>
            <SessionProvider session={session} hasSession={hasSession}>
              <RouteProgressBar />
              <InstallationRedirect />
              <LicenseSessionMonitor />
              <Toaster richColors />
              <PwaRegister />
              <PwaInstallNudge />
              <FloatingThemeToggle />
              <ScrollProgressButton />
              {children}
            </SessionProvider>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
