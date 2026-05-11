import Link from "next/link";
import { FaLinkedinIn } from "react-icons/fa";

export function SocialPill({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof FaLinkedinIn;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </>
  );

  const className =
    "inline-flex h-9 items-center gap-2 rounded-full border border-border bg-muted px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary";

  if (!href) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link href={href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </Link>
  );
}
