import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { City, Country, State } from "@/types/location";

export const locationClientService = {
  getCountries: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Country[]>>("/api/countries"),
    ),

  getStates: (countryId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<State[]>>(`/api/countries/${countryId}/states`),
    ),

  getCities: (stateId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<City[]>>(`/api/states/${stateId}/cities`),
    ),
};
