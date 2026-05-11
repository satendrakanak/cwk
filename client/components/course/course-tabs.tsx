"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WhatYouWillLearn } from "./sections/what-you-will-learn";
import { CourseContent } from "./sections/course-content";
import { CourseInstructor } from "./sections/course-instructor";
import { CourseDetails } from "./sections/course-details";
import { CourseRequirements } from "./sections/course-requirements";
import { Course } from "@/types/course";
import { Testimonial } from "@/types/testimonial";
import { CourseTestimonials } from "./sections/course-testimonials";
import { CourseRatingReviews } from "./sections/course-rating-reviews";
import { CourseFaqs } from "./sections/course-faqs";
import { cn } from "@/lib/utils";

const baseTabs = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Content" },
  { id: "details", label: "Details" },
  { id: "requirements", label: "Requirements" },
  { id: "instructor", label: "Instructor" },
  { id: "reviews", label: "Reviews" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faqs", label: "FAQs" },
];

export const CourseTabs = ({
  course,
  testimonials,
}: {
  course: Course;
  testimonials: Testimonial[];
}) => {
  const [active, setActive] = useState("overview");
  const [isSticky, setIsSticky] = useState(false);
  const tabs = useMemo(() => baseTabs, []);

  const tabsRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const yOffset = -120;
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-105px 0px 0px 0px",
      },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScrollActive = () => {
      let current = "overview";

      for (const tab of tabs) {
        const el = document.getElementById(tab.id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();

        if (rect.top <= 160) {
          current = tab.id;
        }
      }

      setActive(current);
    };

    handleScrollActive();

    window.addEventListener("scroll", handleScrollActive);
    return () => window.removeEventListener("scroll", handleScrollActive);
  }, [tabs]);

  return (
    <div className="relative">
      <div ref={sentinelRef} />

      <div
        ref={tabsRef}
        className={cn(
          "z-40 mb-8 rounded-3xl border border-border bg-card p-2 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition-all duration-300",
          isSticky &&
            "sticky top-20 bg-card/85 shadow-[0_18px_65px_color-mix(in_oklab,var(--primary)_14%,transparent)] backdrop-blur-xl",
        )}
      >
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-1">
          {tabs.map((tab) => {
            const isCurrent = active === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleScroll(tab.id)}
                className={cn(
                  "relative inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full px-4 text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-300",
                  "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  isCurrent &&
                    "bg-primary text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_28%,transparent)] hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-8">
        <div id="overview" className="scroll-mt-36">
          <WhatYouWillLearn course={course} />
        </div>

        <div id="content" className="scroll-mt-36">
          <CourseContent course={course} />
        </div>

        <div id="details" className="scroll-mt-36">
          <CourseDetails course={course} />
        </div>

        <div id="requirements" className="scroll-mt-36">
          <CourseRequirements course={course} />
        </div>

        <div id="instructor" className="scroll-mt-36">
          <CourseInstructor course={course} />
        </div>

        <div id="reviews" className="scroll-mt-36">
          <CourseRatingReviews course={course} />
        </div>

        <div id="testimonials" className="scroll-mt-36">
          <CourseTestimonials testimonials={testimonials} />
        </div>

        <div id="faqs" className="scroll-mt-36">
          <CourseFaqs faqs={course.faqs} />
        </div>
      </div>
    </div>
  );
};
