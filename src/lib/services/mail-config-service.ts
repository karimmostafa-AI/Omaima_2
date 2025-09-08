import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';
import nodemailer from 'nodemailer';

export interface MailConfiguration {
  mailer: 'smtp';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  encryption?: 'tls' | 'ssl' | 'none';
  from_address?: string;
  from_name?: string;
}

const MAIL_SETTINGS_KEY = 'mail_configuration';

export class MailConfigService {
  /**
   * Get the mail configuration, decrypting sensitive values.
   */
  static async getMailConfig(): Promise<MailConfiguration | null> {
    const config = await SettingsService.getSetting(MAIL_SETTINGS_KEY);
    if (config && config.password) {
      config.password = EncryptionService.decrypt(config.password);
    }
    return config;
  }

  /**
   * Save the mail configuration, encrypting sensitive values.
   */
  static async saveMailConfig(data: MailConfiguration): Promise<void> {
    const configToSave = { ...data };
    if (configToSave.password) {
      configToSave.password = EncryptionService.encrypt(configToSave.password);
    }
    await SettingsService.updateSetting(MAIL_SETTINGS_KEY, configToSave);
  }

  /**
   * Send a test email using the saved configuration.
   */
  static async sendTestEmail(recipient: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getMailConfig();

    if (!config || !config.host || !config.port || !config.from_address) {
      return { success: false, message: 'Mail configuration is incomplete.' };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.encryption === 'ssl',
        auth: {
          user: config.username,
          pass: config.password,
        },
        tls: {
            rejectUnauthorized: false
        }
      });

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
