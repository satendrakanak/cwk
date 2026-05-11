import { User } from "./user";

export type ContactLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CLOSED";

export type ContactLead = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  subject?: string | null;
  message: string;
  status: ContactLeadStatus;
  source?: string | null;
  pageUrl?: string | null;
  adminNotes?: string | null;
  user?: User | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateContactLeadPayload = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  subject?: string;
  message: string;
  source?: string;
  pageUrl?: string;
};

export type UpdateContactLeadPayload = {
  status?: ContactLeadStatus;
  adminNotes?: string;
};
