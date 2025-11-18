import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.sejoga',
  appName: 'SeJoga',
  webDir: 'out',  // ✅ Conteúdo local
  server: {
    androidScheme: 'https'
  }
};

export default config;