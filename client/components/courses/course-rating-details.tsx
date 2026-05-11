"use client";

import RatingStars from "@/components/courses/rating-star";
import { Award, Star, Users } from "lucide-react";

interface CourseRatingDetailsProps {
  rating: number;
  reviews: number;
  enrolledStudentCount: number;
}

const CourseRatingDetails = ({
  rating,
  reviews,
  enrolledStudentCount,
}: CourseRatingDetailsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_rgba(2,6,23,0.18)] backdrop-blur-md">
        <Award className="h-4 w-4 text-white/85" />
        <span>Bestseller</span>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-md">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

        <span className="font-semibold text-white">{rating}</span>

        <RatingStars rating={rating} />

        <span className="text-white/60">({reviews.toLocaleString()})</span>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-md">
        <Users className="h-4 w-4 text-white/85" />

        <span>
          <strong className="font-semibold text-white">
            {enrolledStudentCount.toLocaleString()}
          </strong>{" "}
          students
        </span>
      </div>
    </div>
  );
};

export default CourseRatingDetails;
