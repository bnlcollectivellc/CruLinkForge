// Type declarations for optional email providers
// These modules are dynamically imported and only needed if you use those providers

declare module '@sendgrid/mail' {
  interface SendGridMessage {
    to: string;
    from: string;
    subject: string;
    html: string;
    replyTo?: string;
  }

  interface SendGridResponse {
    headers: Record<string, string>;
  }

  const sgMail: {
    setApiKey: (key: string) => void;
    send: (msg: SendGridMessage) => Promise<[SendGridResponse, Record<string, unknown>]>;
  };

  export default sgMail;
}

declare module 'resend' {
  interface ResendEmailParams {
    from: string;
    to: string;
    subject: string;
    html: string;
    reply_to?: string;
  }

  interface ResendResponse {
    data?: { id: string };
    error?: Error;
  }

  export class Resend {
    constructor(apiKey?: string);
    emails: {
      send: (params: ResendEmailParams) => Promise<ResendResponse>;
    };
  }
}
