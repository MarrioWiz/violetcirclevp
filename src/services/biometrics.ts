import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/** En Expo Go (iOS) Face ID no está disponible para la app y cae al código del teléfono. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export interface BiometricInfo {
  available: boolean;
  label: string;
}

export async function getBiometricInfo(): Promise<BiometricInfo> {
  if (Platform.OS === 'web') return { available: false, label: 'Biometría' };
  try {
    const [hasHardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const face = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const label = Platform.OS === 'ios' ? (face ? 'Face ID' : 'Touch ID') : face ? 'reconocimiento facial' : 'huella';
    return { available: hasHardware && enrolled, label };
  } catch {
    return { available: false, label: 'Biometría' };
  }
}

export async function authenticateBiometric(prompt: string): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      cancelLabel: 'Usar PIN',
      // El PIN propio es el respaldo; no permitimos el código del teléfono como atajo.
      disableDeviceFallback: true,
    });
    return res.success;
  } catch {
    return false;
  }
}
