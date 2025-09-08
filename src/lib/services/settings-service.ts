import { prisma } from '@/lib/db';
import { SystemSettings } from '@prisma/client';

export class SettingsService {
  /**
   * Get a setting by its key.
   */
  static async getSetting(key: string): Promise<any | null> {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });
    return setting ? setting.value : null;
  }

  /**
   * Get multiple settings by their keys.
   */
  static async getSettings(keys: string[]): Promise<Record<string, any>> {
      const settings = await prisma.systemSettings.findMany({
          where: { key: { in: keys } },
      });

      const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
      }, {} as Record<string, any>);

      return keys.reduce((acc, key) => {
          acc[key] = settingsMap[key] || null;
          return acc;
      }, {} as Record<string, any>);
  }

  /**
   * Create or update a setting.
   */
  static async updateSetting(key: string, value: any): Promise<SystemSettings> {
    const valueToStore = value === null ? {} : value;
    return prisma.systemSettings.upsert({
      where: { key },
      update: { value: valueToStore },
      create: { key, value: valueToStore },
    });
  }

  /**
   * Create or update multiple settings in a transaction.
   */
  static async updateSettings(settings: { key: string; value: any }[]): Promise<void> {
    const operations = settings.map(({ key, value }) =>
        prisma.systemSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        })
    );
    await prisma.$transaction(operations);
  }
}
