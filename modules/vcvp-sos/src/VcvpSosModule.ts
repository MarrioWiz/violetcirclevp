import { NativeModule, requireOptionalNativeModule } from 'expo';

declare class VcvpSosModule extends NativeModule {
  /** Envía el mismo SMS a cada número. Devuelve cuántos envíos se pidieron al sistema. */
  sendSms(phones: string[], message: string): Promise<number>;
  isVolumeTriggerEnabled(): boolean;
  openAccessibilitySettings(): void;
  isLauncherEntryEnabled(): boolean;
  setLauncherEntryEnabled(enabled: boolean): void;
  setIconShortcutEnabled(enabled: boolean): boolean;
  isIconShortcutEnabled(): boolean;
  setShowWhenLocked(on: boolean): Promise<boolean>;
  /** ¿El enlace de alerta trae la clave secreta de esta instalación? */
  isValidSosToken(token: string | null): boolean;
}

// Opcional: solo existe en la build nativa de Android.
export default requireOptionalNativeModule<VcvpSosModule>('VcvpSos');
