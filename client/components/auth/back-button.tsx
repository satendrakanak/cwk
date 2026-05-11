"use client";

import Link from "next/link";
import { FieldDescription } from "../ui/field";

interface BackButtonProps {
  label: string;
  href: string;
}

export const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <FieldDescription className="text-center">
      <Link href={href}>{label}</Link>
    </FieldDescription>
  );
};
