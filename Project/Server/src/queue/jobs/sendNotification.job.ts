export const SEND_NOTIFICATION_JOB = "send-notification";

export interface SendNotificationJobData {
  logId: string;
  notificationId: string;
  phone: string;
  whatsappTemplateName: string;
  bodyVariables: string[];
  attachmentUrl?: string;
  attachmentType?: string;
  buttonUrl?: string;
}
