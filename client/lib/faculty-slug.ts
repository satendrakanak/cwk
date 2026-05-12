import type { User } from "@/types/user";

export function slugifyFacultyName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getFacultySlug(faculty?: Pick<User, "firstName" | "lastName" | "username"> | null) {
  if (!faculty) return "";

  const nameSlug = slugifyFacultyName(
    [faculty.firstName, faculty.lastName].filter(Boolean).join(" "),
  );

  return nameSlug || faculty.username || "";
}

export function getFacultyHref(faculty?: Pick<User, "firstName" | "lastName" | "username"> | null) {
  const slug = getFacultySlug(faculty);
  return slug ? `/instructors/${slug}` : "/instructors";
}
