import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: 'public',  // ✅ Usa pasta public
  server: {
    url: 'https://sejoga.app',  // ✅ Continua apontando pro site
    cleartext: true,
    allowNavigation: ['sejoga.app', '*.sejoga.app']
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;