export interface SendEmailI {
  ccAddresses?: string[];
  bccAddresses?: string[];
  toAddresses: string[];
  htmlData: string;
  textData?: string;
  subject: string;
  source?: string;
  replyToAddresses?: string[];
}

export interface SendRawEmailI {
  ccAddresses?: string[];
  toAddresses: string[];
  htmlData: string;
  textData?: string;
  subject: string;
  source?: string;
  replyToAddresses?: string[];
  fileName: string;
  file: string;
}

export interface SendEmailTemplateI {
  templateName: string;
  source: string;
  toAddresses: string[];
  templateData: object;
}

export interface EmailTemplateT {
  templateName: string;
  subject: string;
  template: string;
}
