import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

const CAPTURE_KEY = 'vcvp-privacy';

/**
 * Android: activa FLAG_SECURE (sin capturas y con la miniatura de "Recientes" en negro).
 * iOS: oculta el contenido en grabaciones de pantalla. Las capturas de iOS no se pueden bloquear;
 * para eso está la capa de privacidad del layout.
 */
export async function setScreenProtection(on: boolean): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    if (on) await ScreenCapture.preventScreenCaptureAsync(CAPTURE_KEY);
    else await ScreenCapture.allowScreenCaptureAsync(CAPTURE_KEY);
  } catch {
    // Si el módulo no está disponible, la capa de privacidad sigue funcionando.
  }
}

export const DISCREET_ICON = 'Calculadora';

/** El módulo nativo solo existe en builds reales; en web o si falla, se informa como no soportado. */
async function iconsModule() {
  if (Platform.OS === 'web') return null;
  try {
    return await import('expo-alternate-app-icons');
  } catch {
    return null;
  }
}

export async function supportsDiscreetIcon(): Promise<boolean> {
  const mod = await iconsModule();
  return !!mod?.supportsAlternateIcons;
}

export async function isDiscreetIconOn(): Promise<boolean> {
  const mod = await iconsModule();
  try {
    return mod?.getAppIconName() === DISCREET_ICON;
  } catch {
    return false;
  }
}

export async function setDiscreetIcon(on: boolean): Promise<boolean> {
  const mod = await iconsModule();
  if (!mod?.supportsAlternateIcons) return false;
  try {
    await mod.setAlternateAppIcon(on ? DISCREET_ICON : null);
    return true;
  } catch {
    return false;
  }
}
