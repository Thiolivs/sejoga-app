import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: 'public',
  server: {
    url: 'https://sejoga.app',
    cleartext: true,
    allowNavigation: ['sejoga.app', '*.sejoga.app']  // ✅ ADICIONE
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;