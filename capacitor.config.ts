import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: 'public',  // ✅ Só uma pasta pequena
  server: {
    url: 'https://sejoga.app',
    cleartext: true
  }
};

export default config;