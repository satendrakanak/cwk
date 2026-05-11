export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: MailAttachment[];
}

export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
  delayMs?: number;
}

export interface MailAttachment {
  filename: string;
  content?: string;
  encoding?: string;
  contentType?: string;
  path?: string;
}
