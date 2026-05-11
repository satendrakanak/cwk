import { apiServer } from "@/lib/api/server";
import { ApiResponse, Paginated } from "@/types/api";
import { Testimonial, TestimonialType } from "@/types/testimonial";

const PUBLIC_REVALIDATE_SECONDS = 60;

type PublicTestimonialsQuery = {
  type?: TestimonialType;
  courseId?: number;
  page?: number;
  limit?: number;
};

const buildQueryString = (params: Record<string, string | number | undefined>) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

export const testimonialServerService = {
  getAll: () =>
    apiServer.get<ApiResponse<Paginated<Testimonial>>>("/testimonials"),

  getById: (id: string) =>
    apiServer.get<ApiResponse<Testimonial>>(`/testimonials/${id}`),

  getPublic: (query: PublicTestimonialsQuery = {}) => {
    const queryString = buildQueryString(query);

    return apiServer.get<ApiResponse<Paginated<Testimonial>>>(
      `/testimonials/public${queryString ? `?${queryString}` : ""}`,
      { next: { revalidate: PUBLIC_REVALIDATE_SECONDS } },
    );
  },

  getFeatured: (limit = 6) =>
    apiServer.get<ApiResponse<Testimonial[]>>(
      `/testimonials/featured?limit=${limit}`,
      { next: { revalidate: PUBLIC_REVALIDATE_SECONDS } },
    ),
};
