import { AppSettings } from '@/types';
import { performOperation } from './syncHelpers';

export const updateSettings = async (settings: Partial<AppSettings>): Promise<AppSettings> => {
  const updatedSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  } as AppSettings;

  const result = await performOperation(
    'settings',
    'update',
    updatedSettings,
  );
  if (!result.success) throw result.error;
  return updatedSettings;
};