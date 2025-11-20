import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: 'out',  // ✅ Conteúdo local
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;