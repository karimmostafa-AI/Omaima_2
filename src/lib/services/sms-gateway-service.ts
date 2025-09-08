import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';

export interface SmsGatewayConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface AllSmsGatewayConfigs {
  [gatewayName: string]: SmsGatewayConfig;
}

const SMS_GATEWAYS_KEY = 'sms_gateways_config';
const SENSITIVE_KEYS: { [gatewayName: string]: string[] } = {
  twilio: ['sid', 'token'],
  vonage: ['api_key', 'api_secret'],
};

export class SmsGatewayService {
  static async getGatewayConfigs(): Promise<AllSmsGatewayConfigs> {
    const configs = await SettingsService.getSetting(SMS_GATEWAYS_KEY) as AllSmsGatewayConfigs | null;
    if (!configs) return {};

    for (const gatewayName in configs) {
      const sensitive = SENSITIVE_KEYS[gatewayName] || [];
      for (const key of sensitive) {
        if (configs[gatewayName] && configs[gatewayName][key]) {
          configs[gatewayName][key] = EncryptionService.decrypt(configs[gatewayName][key]);
        }
      }
    }
    return configs;
  }

  static async saveGatewayConfigs(data: AllSmsGatewayConfigs): Promise<void> {
    const configsToSave = JSON.parse(JSON.stringify(data));

    for (const gatewayName in configsToSave) {
      const sensitive = SENSITIVE_KEYS[gatewayName] || [];
      for (const key of sensitive) {
        if (configsToSave[gatewayName] && configsToSave[gatewayName][key]) {
          configsToSave[gatewayName][key] = EncryptionService.encrypt(configsToSave[gatewayName][key]);
        }
      }
    }

    await SettingsService.updateSetting(SMS_GATEWAYS_KEY, configsToSave);
  }
}
