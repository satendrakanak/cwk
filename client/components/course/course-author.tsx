"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface CourseAuthorProps {
  authorName: string;
  authorPhoto: StaticImageData;
}

const CourseAuthor = ({ authorName, authorPhoto }: CourseAuthorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-white/80 md:my-4 md:justify-start">
      <Image
        src={authorPhoto}
        alt={authorName}
        className="h-8 w-8 rounded-full border-2 border-white/70 object-cover"
      />

      <p>
        <span>By </span>

        <Link
          href="/"
          className="font-semibold text-white underline-offset-4 transition hover:underline"
        >
          {authorName}
        </Link>
      </p>
    </div>
  );
};

export default CourseAuthor;
