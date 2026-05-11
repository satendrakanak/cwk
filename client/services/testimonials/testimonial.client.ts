import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  CreateTestimonialPayload,
  Testimonial,
  TestimonialType,
  UpdateTestimonialPayload,
} from "@/types/testimonial";

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

export const testimonialClientService = {
  getAll: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Paginated<Testimonial>>>("/api/testimonials"),
    ),

  getById: (id: string) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Testimonial>>(`/api/testimonials/${id}`),
    ),

  create: (data: CreateTestimonialPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Testimonial>>("/api/testimonials", data),
    ),

  update: (id: string, data: UpdateTestimonialPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Testimonial>>(`/api/testimonials/${id}`, data),
    ),

  delete: (id: string) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/testimonials/${id}`,
      ),
    ),

  getPublic: (query: PublicTestimonialsQuery = {}) => {
    const queryString = buildQueryString(query);

    return apiClient.get<ApiResponse<Paginated<Testimonial>>>(
      `/api/testimonials/public${queryString ? `?${queryString}` : ""}`,
    );
  },

  getFeatured: (limit = 6) =>
    apiClient.get<ApiResponse<Testimonial[]>>(
      `/api/testimonials/featured?limit=${limit}`,
    ),
};
