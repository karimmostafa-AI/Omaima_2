import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';

export interface ReCaptchaConfig {
  site_key?: string;
  secret_key?: string;
  status: 'active' | 'inactive';
}

const RECAPTCHA_SETTINGS_KEY = 'recaptcha_config';

export class ReCaptchaService {
  static async getConfig(): Promise<ReCaptchaConfig | null> {
    const config = await SettingsService.getSetting(RECAPTCHA_SETTINGS_KEY);
    if (config && config.secret_key) {
      config.secret_key = EncryptionService.decrypt(config.secret_key);
    }
    return config;
  }

  static async saveConfig(data: ReCaptchaConfig): Promise<void> {
    const configToSave = { ...data };
    if (configToSave.secret_key) {
      configToSave.secret_key = EncryptionService.encrypt(configToSave.secret_key);
    }
    await SettingsService.updateSetting(RECAPTCHA_SETTINGS_KEY, configToSave);
  }
}
