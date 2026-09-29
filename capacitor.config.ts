import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ciphergrid.mobile',
  appName: 'CipherGrid',
  webDir: 'dist',
  plugins: { Camera: { presentationStyle: 'fullscreen' } },
};

export default config;
