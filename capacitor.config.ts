import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: '.next', 
  server: {
    url: 'https://sejoga.app', // ✅ Aponta para seu site na Vercel
    cleartext: true
  }
};

export default config;