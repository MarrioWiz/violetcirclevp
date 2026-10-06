# VioletCircleVP en Android (APK release)

La app se compila **localmente** con Android Studio / Gradle. No usa Expo Go ni compilación en la nube.

## Por qué "release" y no "debug"

- **Release**: el código de la app va dentro del APK. Se instala y funciona sola, sin la computadora. Es lo que se reparte.
- **Debug**: el APK busca el código en la computadora (servidor Metro). Instalado solo, se queda trabado en la pantalla de inicio. Solo sirve para programar con el teléfono conectado.

## Requisitos (ya instalados en esta compu)

- Android Studio (trae Java en `C:\Program Files\Android\Android Studio\jbr`).
- Android SDK en `C:\Users\Mario\AppData\Local\Android\Sdk`.
- `npm install` hecho en el proyecto y el archivo `.env` con la configuración de Firebase.

## Compilar el APK release

```bash
cd C:\laragon\www\violetcirclevp
npx expo prebuild -p android --clean     # solo si cambiaste app.config.ts, plugins o dependencias nativas
cd android
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
gradlew.bat assembleRelease -x lintVitalRelease -x lintVitalAnalyzeRelease
```

El APK queda en `android/app/build/outputs/apk/release/app-release.apk` (incluye ARM de 64 y 32 bits, funciona en casi cualquier teléfono).

> `-x lintVital…` salta una revisión que se queda sin memoria; no afecta a la app.

## Firma (importante)

- La llave de firma está en `keystore/violetcirclevp-release.keystore` y sus contraseñas en `keystore/keystore.properties`. **Esa carpeta no se sube a git.**
- El plugin `plugins/withReleaseSigning.js` vuelve a configurar la firma en cada `prebuild`, así que **borrar o regenerar `android/` no pierde nada**.
- **Haz una copia de la carpeta `keystore/`** en un lugar seguro (USB o nube privada). Si se pierde, los teléfonos que ya tienen la app no podrán actualizarla: habría que desinstalar (y se borrarían sus datos locales).

## Instalar en un teléfono

**Con cable (USB, depuración activada):**
```bash
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

**Sin cable:** copia el APK al teléfono (WhatsApp a ti misma, Drive, USB) y ábrelo. Android pedirá permitir "Instalar apps desconocidas" para esa app.

## Qué funciona en la build nativa (y no en Expo Go)

| Función | Estado |
|---|---|
| Huella / reconocimiento facial | Sí |
| Bloqueo de capturas de pantalla y miniatura negra en "Recientes" (FLAG_SECURE) | Sí, mientras "Ocultar vista previa" esté activo |
| Ícono discreto "Calculadora" (Ajustes → Seguridad) | Sí. Android cierra la app al cambiarlo; después búscala como "Calculadora". |
| Nombre e ícono propios | Sí |
| Recordatorios locales | Sí (Android 13+ pide permiso de notificaciones) |

## Permisos que pide la app

| Permiso | Para qué | Cuándo |
|---|---|---|
| Contactos (solo lectura) | Elegir a alguien para el círculo | Al tocar "Elegir de mis contactos" |
| Ubicación **aproximada** | Agregarla al mensaje del círculo | Solo si activa el interruptor |
| Cámara / Fotos | Adjuntar evidencia | Al adjuntar |
| Biometría | Desbloquear | Si lo activa |
| Notificaciones | Recordatorio de autocuidado | Si lo activa |

Bloqueados a propósito: ubicación precisa, ubicación en segundo plano, micrófono, escribir contactos y ventanas superpuestas.

## Mini app "Pedir ayuda" (`companion/`)

El botón lateral de Samsung (doble pulsación → Abrir app) y Quick Tap de Pixel listan **apps**, no
accesos: siempre abren la actividad principal y nunca muestran la entrada `SosLauncherActivity`.
Samsung además no deja cambiar ese ajuste por ADB (`function_key_config_doublepress_*` rechaza
escrituras del shell).

Por eso existe `companion/`: una app aparte (`mx.uvp.violetcirclevp.ayuda`, ~180 KB, **sin
permisos**, Play Protect no la bloquea) cuya única actividad abre `violetcirclevp://sos` en
VioletCircleVP y se cierra. Se asigna como app del botón lateral / Quick Tap.

```bash
cd companion
JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" ./gradlew assembleRelease
# → app/build/outputs/apk/release/app-release.apk  (firmada con la misma llave de keystore/)
```

No abrirla para probar sin un contacto avisado: dispara la alerta real (10 s para cancelar).
