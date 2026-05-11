"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { Course } from "@/types/course";
import Container from "../container";
// import CourseContainer from "@/components/courses/course-container";
// import CourseDetails from "@/components/courses/course-details";
//import { Categories, Chapters, Courses, Faqs } from "@prisma/client";

interface SingleCourseProps {
  course: Course;
  className?: string;
}

const SingleCourse = ({ course, className }: SingleCourseProps) => {
  return (
    <div
      className={cn(
        "w-full flex items-start justify-between text-start bg-gray-100",
        className,
      )}
    >
      <Container>
        <div className="w-full text-start items-start bg-white rounded-md shadow-sm p-4">
          <div className="relative w-full h-full">
            <Image
              src={course.image?.path || "/placeholder.jpg"}
              alt={course.title || "Course Image"}
              width={950}
              height={600}
              className="rounded-md"
            />
          </div>
        </div>
        {/* <CourseDetails course={course} /> */}
      </Container>
    </div>
  );
};

export default SingleCourse;
