import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';

export interface FirebaseConfig {
  server_key?: string;
}

const FIREBASE_SETTINGS_KEY = 'firebase_config';

export class FirebaseService {
  static async getConfig(): Promise<FirebaseConfig | null> {
    const config = await SettingsService.getSetting(FIREBASE_SETTINGS_KEY);
    if (config && config.server_key) {
      config.server_key = EncryptionService.decrypt(config.server_key);
    }
    return config;
  }

  static async saveConfig(data: FirebaseConfig): Promise<void> {
    const configToSave = { ...data };
    if (configToSave.server_key) {
      configToSave.server_key = EncryptionService.encrypt(configToSave.server_key);
    }
    await SettingsService.updateSetting(FIREBASE_SETTINGS_KEY, configToSave);
  }
}
