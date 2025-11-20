import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: 'public',
  backgroundColor: '#0096FF',
  server: {
    url: 'https://sejoga.app',
    cleartext: true,
    allowNavigation: ['sejoga.app', '*.sejoga.app']
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0096FF'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#0096FF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0096FF',
      overlaysWebView: false  // ✅ CRÍTICO: false
    }
  }
};

export default config;