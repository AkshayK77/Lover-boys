import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.motionlab.app',
  appName: 'MotionLab',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#264653',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#264653',
    },
  },
}

export default config
