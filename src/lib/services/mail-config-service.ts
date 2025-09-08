import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';
import nodemailer from 'nodemailer';

export interface MailConfiguration {
  mailer: 'smtp' | 'mailgun' | 'postmark';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  encryption?: 'tls' | 'ssl' | 'none';
  from_address?: string;
  from_name?: string;
  mailgun_domain?: string;
  mailgun_secret?: string;
  postmark_token?: string;
}

const MAIL_SETTINGS_KEY = 'mail_configuration';

export class MailConfigService {
  /**
   * Get the mail configuration, decrypting sensitive values.
   */
  static async getMailConfig(): Promise<MailConfiguration | null> {
    const config = await SettingsService.getSetting(MAIL_SETTINGS_KEY);
    if (config) {
      if (config.password) config.password = EncryptionService.decrypt(config.password);
      if (config.mailgun_secret) config.mailgun_secret = EncryptionService.decrypt(config.mailgun_secret);
      if (config.postmark_token) config.postmark_token = EncryptionService.decrypt(config.postmark_token);
    }
    return config;
  }

  /**
   * Save the mail configuration, encrypting sensitive values.
   */
  static async saveMailConfig(data: MailConfiguration): Promise<void> {
    const configToSave = { ...data };
    if (configToSave.password) configToSave.password = EncryptionService.encrypt(configToSave.password);
    if (configToSave.mailgun_secret) configToSave.mailgun_secret = EncryptionService.encrypt(configToSave.mailgun_secret);
    if (configToSave.postmark_token) configToSave.postmark_token = EncryptionService.encrypt(configToSave.postmark_token);

    await SettingsService.updateSetting(MAIL_SETTINGS_KEY, configToSave);
  }

  /**
   * Send a test email using the saved configuration.
   */
  static async sendTestEmail(recipient: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getMailConfig();

    if (!config || !config.from_address) {
      return { success: false, message: 'Mail configuration is incomplete.' };
    }

    try {
      let transporter;
      switch (config.mailer) {
        case 'smtp':
          if (!config.host || !config.port) return { success: false, message: 'SMTP host and port are required.' };
          transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.encryption === 'ssl',
            auth: { user: config.username, pass: config.password },
            tls: { rejectUnauthorized: false }
          });
          break;
        // NOTE: In a real app, you'd use the official mailgun/postmark SDKs.
        // This is a simplified simulation using nodemailer's capabilities.
        case 'mailgun':
           if (!config.mailgun_domain || !config.mailgun_secret) return { success: false, message: 'Mailgun domain and secret are required.' };
           // This is a simplified simulation. A real implementation would use Mailgun's API.
           console.log("Simulating Mailgun send");
           transporter = nodemailer.createTransport({ host: 'smtp.mailgun.org', port: 587, auth: { user: `postmaster@${config.mailgun_domain}`, pass: config.mailgun_secret } });
           break;
        case 'postmark':
            if (!config.postmark_token) return { success: false, message: 'Postmark token is required.' };
            // This is a simplified simulation. A real implementation would use Postmark's API.
            console.log("Simulating Postmark send");
            transporter = nodemailer.createTransport({ host: 'smtp.postmarkapp.com', port: 587, auth: { user: config.postmark_token, pass: config.postmark_token } });
            break;
        default:
          return { success: false, message: 'Invalid mailer specified.' };
      }

      await transporter.verify();

      await transporter.sendMail({
        from: `"${config.from_name || 'Test'}" <${config.from_address}>`,
        to: recipient,
        subject: 'Test Email from Platform',
        text: 'This is a test email to verify your mail configuration is working correctly.',
      });

      return { success: true, message: 'Test email sent successfully!' };
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      return { success: false, message: `Failed to send email: ${error.message}` };
    }
  }
}
