// Email service for CruLink Forge
// Configure with your preferred email provider (SendGrid, Resend, AWS SES, etc.)
//
// To use SendGrid: npm install @sendgrid/mail
// To use Resend: npm install resend

/// <reference path="./providers.d.ts" />

export * from './templates';

export interface EmailConfig {
  from: string;
  provider: 'sendgrid' | 'resend' | 'ses' | 'smtp' | 'console';
  apiKey?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

// Default config - logs to console in development
let emailConfig: EmailConfig = {
  from: 'noreply@forge.crulink.io',
  provider: 'console',
};

export const configureEmail = (config: Partial<EmailConfig>) => {
  emailConfig = { ...emailConfig, ...config };
};

export const sendEmail = async (params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const { to, subject, html, replyTo } = params;

  switch (emailConfig.provider) {
    case 'console':
      // Development mode - log to console
      console.log('='.repeat(60));
      console.log('EMAIL SENT (dev mode)');
      console.log('='.repeat(60));
      console.log(`To: ${to}`);
      console.log(`From: ${emailConfig.from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Reply-To: ${replyTo || emailConfig.from}`);
      console.log('-'.repeat(60));
      console.log('HTML content logged (first 500 chars):');
      console.log(html.substring(0, 500) + '...');
      console.log('='.repeat(60));
      return { success: true, messageId: `dev-${Date.now()}` };

    case 'sendgrid':
      // SendGrid implementation
      // Install: npm install @sendgrid/mail
      try {
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(emailConfig.apiKey || '');
        const result = await sgMail.default.send({
          to,
          from: emailConfig.from,
          subject,
          html,
          replyTo,
        });
        return { success: true, messageId: result[0].headers['x-message-id'] };
      } catch (error) {
        console.error('SendGrid error:', error);
        return { success: false, error: String(error) };
      }

    case 'resend':
      // Resend implementation
      // Install: npm install resend
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(emailConfig.apiKey);
        const result = await resend.emails.send({
          from: emailConfig.from,
          to,
          subject,
          html,
          reply_to: replyTo,
        });
        return { success: true, messageId: result.data?.id };
      } catch (error) {
        console.error('Resend error:', error);
        return { success: false, error: String(error) };
      }

    default:
      console.warn(`Email provider "${emailConfig.provider}" not implemented`);
      return { success: false, error: 'Provider not implemented' };
  }
};

// Helper functions for common email scenarios
import {
  orderConfirmationEmail,
  orderAcceptedEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  newOrderAlertEmail,
  dailySummaryEmail,
  type OrderData,
  type FabricatorOrderData,
  type DailySummaryData,
} from './templates';

export const sendOrderConfirmation = async (data: OrderData) => {
  const email = orderConfirmationEmail(data);
  return sendEmail({
    to: data.customerEmail,
    subject: email.subject,
    html: email.html,
  });
};

export const sendOrderAccepted = async (data: OrderData) => {
  const email = orderAcceptedEmail(data);
  return sendEmail({
    to: data.customerEmail,
    subject: email.subject,
    html: email.html,
  });
};

export const sendOrderShipped = async (data: OrderData) => {
  const email = orderShippedEmail(data);
  return sendEmail({
    to: data.customerEmail,
    subject: email.subject,
    html: email.html,
  });
};

export const sendOrderDelivered = async (data: OrderData) => {
  const email = orderDeliveredEmail(data);
  return sendEmail({
    to: data.customerEmail,
    subject: email.subject,
    html: email.html,
  });
};

export const sendNewOrderAlert = async (data: FabricatorOrderData, fabricatorEmail: string) => {
  const email = newOrderAlertEmail(data);
  return sendEmail({
    to: fabricatorEmail,
    subject: email.subject,
    html: email.html,
  });
};

export const sendDailySummary = async (data: DailySummaryData, fabricatorEmail: string) => {
  const email = dailySummaryEmail(data);
  return sendEmail({
    to: fabricatorEmail,
    subject: email.subject,
    html: email.html,
  });
};
