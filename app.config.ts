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
      'android.permission.CAMERA',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.ACCESS_COARSE_LOCATION',
      // Precisa solo para la alerta "Pedir ayuda" (para que puedan encontrarla).
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
    ],
    // Privacidad: solo ubicación aproximada y sin micrófono ni ventanas superpuestas.
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.WRITE_CONTACTS',
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
        microphonePermission: false,
      },
    ],
    ['expo-notifications', { color: VIOLET }],
    '@react-native-community/datetimepicker',
    // Ícono discreto (fase 3): la usuaria puede cambiar el ícono por una "Calculadora".
    // La etiqueta se registra antes: los mods de Android se ejecutan en orden inverso.
    ['./plugins/withDiscreetIconLabel', { Calculadora: 'Calculadora' }],
    [
      'expo-alternate-app-icons',
      [
        {
          name: 'Calculadora',
          ios: './assets/images/icon-calculadora.png',
          android: {
            foregroundImage: './assets/images/icon-calculadora-foreground.png',
            backgroundColor: '#1C1C1E',
          },
        },
      ],
    ],
    './plugins/withReleaseSigning',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
