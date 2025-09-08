import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';

export interface PusherConfig {
  app_id?: string;
  app_key?: string;
  app_secret?: string;
  cluster?: string;
}

const PUSHER_SETTINGS_KEY = 'pusher_config';

export class PusherService {
  static async getConfig(): Promise<PusherConfig | null> {
    const config = await SettingsService.getSetting(PUSHER_SETTINGS_KEY);
    if (config && config.app_secret) {
      config.app_secret = EncryptionService.decrypt(config.app_secret);
    }
    return config;
  }

  static async saveConfig(data: PusherConfig): Promise<void> {
    const configToSave = { ...data };
    if (configToSave.app_secret) {
      configToSave.app_secret = EncryptionService.encrypt(configToSave.app_secret);
    }
    await SettingsService.updateSetting(PUSHER_SETTINGS_KEY, configToSave);
  }
}
