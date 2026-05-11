"use client";

import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FaPhoneVolume } from "react-icons/fa6";
import { TfiEmail } from "react-icons/tfi";
import Container from "@/components/container";
import { useSiteSettings } from "@/context/site-settings-context";
import { cn } from "@/lib/utils";

interface TopbarProps {
  hidden?: boolean;
}

const Topbar = ({ hidden }: TopbarProps) => {
  const { site } = useSiteSettings();

  const socialLinks = [
    {
      name: "Facebook",
      href: site.facebookUrl,
      icon: <FaFacebook className="h-3.5 w-3.5 text-blue-500 md:h-4 md:w-4" />,
    },
    {
      name: "Youtube",
      href: site.youtubeUrl,
      icon: <FaYoutube className="h-3.5 w-3.5 text-red-500 md:h-4 md:w-4" />,
    },
    {
      name: "Instagram",
      href: site.instagramUrl,
      icon: <FaInstagram className="h-3.5 w-3.5 text-pink-500 md:h-4 md:w-4" />,
    },
    {
      name: "Twitter",
      href: site.twitterUrl,
      icon: <FaTwitter className="h-3.5 w-3.5 text-blue-400 md:h-4 md:w-4" />,
    },
    {
      name: "LinkedIn",
      href: site.linkedinUrl,
      icon: <FaLinkedin className="h-3.5 w-3.5 text-blue-500 md:h-4 md:w-4" />,
    },
  ].filter((item) => item.href);

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-50 w-full border-b border-white/8 bg-slate-900/95 text-white backdrop-blur-md transition-all duration-300 dark:border-white/6 dark:bg-[#081020]/90",
        hidden && "-translate-y-full opacity-0",
      )}
    >
      <Container>
        <div className="flex min-h-9 flex-col items-center justify-center gap-1.5 py-1.5 sm:min-h-10 sm:flex-row sm:justify-between sm:gap-4 sm:py-0">
          {/* Social Icons */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/95 transition hover:-translate-y-0.5 hover:bg-white md:h-8 md:w-8"
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] leading-none text-white/85 md:gap-x-5 md:text-sm">
            {site.supportPhone && (
              <a
                href={`tel:${site.supportPhone}`}
                className="flex items-center gap-1.5 transition hover:text-white"
              >
                <FaPhoneVolume className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span>{site.supportPhone}</span>
              </a>
            )}

            {site.supportEmail && (
              <a
                href={`mailto:${site.supportEmail}`}
                className="flex min-w-0 items-center gap-1.5 transition hover:text-white"
              >
                <TfiEmail className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                <span className="max-w-[170px] truncate sm:max-w-[220px]">
                  {site.supportEmail}
                </span>
              </a>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Topbar;
