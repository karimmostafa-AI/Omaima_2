import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';

export interface ProviderConfig {
  enabled: boolean;
  client_id?: string;
  client_secret?: string;
}

export interface AllSocialAuthConfigs {
  [providerName: string]: ProviderConfig;
}

const SOCIAL_AUTH_SETTINGS_KEY = 'social_auth_config';
const SENSITIVE_KEYS: { [providerName: string]: string[] } = {
  google: ['client_secret'],
  facebook: ['client_secret'],
  github: ['client_secret'],
};

export class SocialAuthService {
  static async getConfigs(): Promise<AllSocialAuthConfigs> {
    const configs = await SettingsService.getSetting(SOCIAL_AUTH_SETTINGS_KEY) as AllSocialAuthConfigs | null;
    if (!configs) return {};

    for (const providerName in configs) {
      const sensitive = SENSITIVE_KEYS[providerName] || [];
      for (const key of sensitive) {
        if (configs[providerName] && configs[providerName][key]) {
          configs[providerName][key] = EncryptionService.decrypt(configs[providerName][key]);
        }
      }
    }
    return configs;
  }

  static async saveConfigs(data: AllSocialAuthConfigs): Promise<void> {
    const configsToSave = JSON.parse(JSON.stringify(data));

    for (const providerName in configsToSave) {
      const sensitive = SENSITIVE_KEYS[providerName] || [];
      for (const key of sensitive) {
        if (configsToSave[providerName] && configsToSave[providerName][key]) {
          configsToSave[providerName][key] = EncryptionService.encrypt(configsToSave[providerName][key]);
        }
      }
    }

    await SettingsService.updateSetting(SOCIAL_AUTH_SETTINGS_KEY, configsToSave);
  }
}
