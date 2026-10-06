import type { ExpoConfig } from 'expo/config';

const VIOLET = '#6D28D9';

const config: ExpoConfig = {
  name: 'VioletCircleVP',
  slug: 'violetcirclevp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'violetcirclevp',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'mx.uvp.violetcirclevp',
    buildNumber: '1',
    supportsTablet: false,
    infoPlist: {
      NSContactsUsageDescription:
        'VioletCircleVP usa tus contactos solo para que elijas a quién agregar a tu círculo de confianza. Tus contactos no se suben a ningún servidor.',
      NSLocationWhenInUseUsageDescription:
        'Si tú lo activas, VioletCircleVP agrega tu ubicación aproximada al mensaje para tu círculo. No se guarda ni se envía a ningún servidor.',
      NSPhotoLibraryUsageDescription:
        'VioletCircleVP te permite adjuntar capturas de pantalla a tu bitácora privada. Se guardan solo en este teléfono.',
      NSCameraUsageDescription:
        'VioletCircleVP te permite tomar fotos para tu bitácora privada. Se guardan solo en este teléfono.',
      NSFaceIDUsageDescription:
        'VioletCircleVP usa Face ID para que solo tú puedas abrir la app.',
      LSApplicationQueriesSchemes: ['whatsapp', 'sms', 'tel'],
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'mx.uvp.violetcirclevp',
    adaptiveIcon: {
      backgroundColor: VIOLET,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    permissions: [
      'android.permission.READ_CONTACTS',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
    ],
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
    name: 'VioletCircleVP',
    shortName: 'VioletCircle',
    themeColor: VIOLET,
    backgroundColor: '#FAF7FF',
    lang: 'es-MX',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sharing',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FAF7FF',
        image: './assets/images/splash-icon.png',
        imageWidth: 120,
        dark: { backgroundColor: '#14101F', image: './assets/images/splash-icon.png' },
      },
    ],
    [
      'expo-local-authentication',
      { faceIDPermission: 'VioletCircleVP usa Face ID para que solo tú puedas abrir la app.' },
    ],
    [
      'expo-contacts',
      {
        contactsPermission:
          'VioletCircleVP usa tus contactos solo para que elijas a quién agregar a tu círculo de confianza. Tus contactos no se suben a ningún servidor.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Si tú lo activas, VioletCircleVP agrega tu ubicación aproximada al mensaje para tu círculo. No se guarda ni se envía a ningún servidor.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'VioletCircleVP te permite adjuntar capturas de pantalla a tu bitácora privada. Se guardan solo en este teléfono.',
        cameraPermission:
          'VioletCircleVP te permite tomar fotos para tu bitácora privada. Se guardan solo en este teléfono.',
      },
    ],
    ['expo-notifications', { color: VIOLET }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
