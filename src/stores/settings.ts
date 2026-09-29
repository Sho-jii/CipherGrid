import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';

export type Theme = 'light' | 'dark' | 'system';

export const useSettingsStore = defineStore('settings', {
  state: () => ({ theme: 'light' as Theme, historyEnabled: false, retentionDays: 30, loaded: false }),
  actions: {
    async load() {
      const { value } = await Preferences.get({ key: 'ciphergrid-settings' });
      if (value) {
        try { Object.assign(this, JSON.parse(value) as Partial<{ theme: Theme; historyEnabled: boolean; retentionDays: number }>); } catch { /* keep safe defaults */ }
      }
      this.loaded = true;
    },
    async save() {
      await Preferences.set({ key: 'ciphergrid-settings', value: JSON.stringify({ theme: this.theme, historyEnabled: this.historyEnabled, retentionDays: this.retentionDays }) });
    },
  },
});
