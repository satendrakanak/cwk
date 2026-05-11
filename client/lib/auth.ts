import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";
import { cookies } from "next/headers";

export const getSession = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const hasToken =
      cookieStore.has("accessToken") || cookieStore.has("refreshToken");

    if (!hasToken) return null;

    const data = await apiServer.get<ApiResponse<User>>("/auth/profile");
    return data.data;
  } catch {
    return null;
  }
};
