import { SettingsService } from './settings-service';
import { EncryptionService } from './encryption-service';

export interface GatewayConfig {
  enabled: boolean;
  mode: 'sandbox' | 'live';
  [key: string]: any;
}

export interface AllGatewayConfigs {
  [gatewayName: string]: GatewayConfig;
}

const PAYMENT_GATEWAYS_KEY = 'payment_gateways_config';
const SENSITIVE_KEYS: { [gatewayName: string]: string[] } = {
  stripe: ['stripe_secret_key'],
  paypal: ['paypal_client_secret'],
};

export class PaymentGatewayService {
  /**
   * Get all payment gateway configurations, decrypting sensitive values.
   */
  static async getGatewayConfigs(): Promise<AllGatewayConfigs> {
    const configs = await SettingsService.getSetting(PAYMENT_GATEWAYS_KEY) as AllGatewayConfigs | null;
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

  /**
   * Save all payment gateway configurations, encrypting sensitive values.
   */
  static async saveGatewayConfigs(data: AllGatewayConfigs): Promise<void> {
    const configsToSave = JSON.parse(JSON.stringify(data));

    for (const gatewayName in configsToSave) {
      const sensitive = SENSITIVE_KEYS[gatewayName] || [];
      for (const key of sensitive) {
        if (configsToSave[gatewayName] && configsToSave[gatewayName][key]) {
          configsToSave[gatewayName][key] = EncryptionService.encrypt(configsToSave[gatewayName][key]);
        }
      }
    }

    await SettingsService.updateSetting(PAYMENT_GATEWAYS_KEY, configsToSave);
  }
}
