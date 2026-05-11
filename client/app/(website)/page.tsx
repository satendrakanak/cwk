import ArticlesSection from "@/components/articles/articles-section";
import Faculty from "@/components/courses/faculty";
import HowItWorks from "@/components/courses/how-it-works";
import PopularCourses from "@/components/courses/popular-courses";
import StatsTimeline from "@/components/courses/stats-timeline";
import WhyJoinOurCourses from "@/components/courses/why-join-our-courses";
import Hero from "@/components/sliders/hero";
import { getErrorMessage } from "@/lib/error-handler";
import { articleServerService } from "@/services/articles/article.server";
import { courseServerService } from "@/services/courses/course.server";
import { testimonialServerService } from "@/services/testimonials/testimonial.server";
import { userServerService } from "@/services/users/user.server";
import { Article } from "@/types/article";
import { Course } from "@/types/course";
import { Testimonial } from "@/types/testimonial";
import { FeaturedTestimonialsSection } from "@/components/testimonials/featured-testimonials-section";
import { User } from "@/types/user";
import { buildMetadata } from "@/lib/seo";
import { apiServer } from "@/lib/api/server";
import { redirect } from "next/navigation";

export const metadata = buildMetadata({
  path: "/",
  title: "Practical Coding Courses",
  description:
    "Explore practical coding courses, live classes, exams, certificates, and career-focused learning.",
});

export default async function Home() {
  const installerStatus = await apiServer
    .get<{ data: { isInstalled: boolean } }>("/installer/status")
    .then((response) => response.data)
    .catch(() => null);

  if (installerStatus && !installerStatus.isInstalled) {
    redirect("/install");
  }

  try {
    const [
      coursesResponse,
      articlesResponse,
      testimonialsResponse,
      facultiesResponse,
    ] = await Promise.all([
      courseServerService.getPopularCourses(),
      articleServerService.getAll(),
      testimonialServerService.getFeatured(6),
      userServerService.getFaculties(),
    ]);

    const courses: Course[] = coursesResponse.data;
    const articles: Article[] = articlesResponse.data;
    const testimonials: Testimonial[] = testimonialsResponse.data;
    const faculties: User[] = facultiesResponse.data;

    return (
      <div>
        <Hero courses={courses} />
        <StatsTimeline />
        <WhyJoinOurCourses />
        <PopularCourses courses={courses} />
        <HowItWorks />
        <FeaturedTestimonialsSection testimonials={testimonials} />
        <Faculty faculties={faculties} />
        <ArticlesSection articles={articles} />
      </div>
    );
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
}
