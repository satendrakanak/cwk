import Link from "next/link";

const footerGroups = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Courses",
    links: [
      { label: "All Courses", href: "/courses" },
      { label: "My Courses", href: "/my-courses" },
      { label: "Certificates", href: "/certificates" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
];

export const LearnFooter = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-6 py-10 text-sm">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 font-semibold text-card-foreground">
                {group.title}
              </h4>

              <div className="space-y-2">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CodeWithKasa. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
