import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: 'public',
  server: {
    url: 'https://sejoga.app',
    cleartext: true,
    allowNavigation: ['sejoga.app', '*.sejoga.app']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    StatusBar: {
      style: 'dark',  // ou 'light' dependendo do tema
      backgroundColor: '#EC0577',  // Rosa oficial SeJoga
      overlaysWebView: false  // ✅ IMPORTANTE: não sobrepor
    }
  }
};

export default config;