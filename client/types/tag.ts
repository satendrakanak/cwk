export type CreateTagPayload = {
  name: string;
  slug?: string;
  description?: string;
};

export type UpdateTagPayload = Partial<CreateTagPayload>;

export type Tag = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
};
