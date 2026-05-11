export type ApiErrorResponse = {
  message: string | string[];
  statusCode?: number;
  error?: string;
};

export type ApiResponse<T> = {
  apiVersion: string;
  data: T;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string;
    last: string;
    current: string;
    next: string;
    previous: string;
  };
};
