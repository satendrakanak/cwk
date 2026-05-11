export type EmailTemplate = {
  id: number;
  templateName: string;
  subject: string;
  body: string;
  createAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CreateEmailTemplatePayload = {
  templateName: string;
  subject: string;
  body: string;
};

export type UpdateEmailTemplatePayload = Partial<CreateEmailTemplatePayload>;
