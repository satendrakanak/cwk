"use client";

import { User } from "@/types/user";
import { FacultyCardInner } from "./faculty-card-inner";

export function FacultyGrid({ faculties }: { faculties: User[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {faculties.map((faculty) => (
        <FacultyCardInner key={faculty.id} faculty={faculty} />
      ))}
    </div>
  );
}
