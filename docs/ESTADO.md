# Estado del proyecto — para retomar

Última actualización: 2026-10-12 (v1.2.0: rediseño de UX y asistente Vi, ver `docs/DISENO.md` §8).

Código: https://github.com/MarrioWiz/violetcirclevp (privado, rama `master`).

## Qué hay publicado / instalado

| Qué | Dónde | Versión |
|---|---|---|
| App Android | `release/VioletCircleVP-1.2.0.apk` (63 MB, arm64 + armv7, gitignored) — instalada en el cel 2026-10-12 | 1.2.0 |
| Mini app "Pedir ayuda" | `release/PedirAyuda-1.0.2.apk` (permiso de firma TRIGGER_SOS; 4 s; sobre el bloqueo) · código en `companion/` | 1.0.2 |
| Web (PWA) | https://violetcirclevp-uvp.web.app | rediseño 1.2.0, publicada 2026-10-12 |
| Panel de tendencias | https://violetcirclevp-uvp.web.app/panel/ (Google, solo marioimanol02@gmail.com) | — |
| Firebase | proyecto `violetcirclevp-uvp` (Spark): Auth anónima + Google, Firestore `nam5`, reglas desplegadas | — |

Ambas apps están instaladas por ADB en el Galaxy S24 Ultra de Mario (SM-S928B, Android 16).

## Comandos

```bash
npm test                 # 82 pruebas (Jest)
npm run test:rules       # 17 pruebas de reglas (emulador de Firestore)
npx tsc --noEmit && npx eslint .

# APK release (desde android/, JAVA_HOME = jbr de Android Studio)
./gradlew assembleRelease -x lintVitalRelease -x lintVitalAnalyzeRelease
#   emulador x86_64: añadir -PreactNativeArchitectures=x86_64

# Web + panel
npm run build:web && npx firebase deploy --only hosting

# Mini app
cd companion && ./gradlew assembleRelease

# Instalar en el cel (USB, depuración activada)
adb install --user 0 -r release/VioletCircleVP-1.2.0.apk
adb install --user 0 -r release/PedirAyuda-1.0.2.apk
```

## Cosas que hay que saber

- **Instalar solo por USB/ADB.** Play Protect bloquea el APK si se abre desde WhatsApp/navegador/archivos
  (por `SEND_SMS` + servicio de accesibilidad) y no ofrece "instalar de todos modos". La alternativa es
  apagar un momento "Analizar apps con Play Protect". La mini app sí se instala normal.
- **`--user 0`** en `adb install`: el cel tiene otro perfil (Carpeta Segura, usuario 150) y sin eso falla.
- **Llave de firma** en `keystore/` (gitignored). Sin ella no se puede actualizar la app instalada. Respaldo (2026-10-07): Google Drive de Mario, carpeta "VioletCircleVP - llave de firma (NO BORRAR NI COMPARTIR)" (los 2 archivos).
- **Botón lateral de Samsung / Quick Tap de Pixel**: listan apps, no accesos → se asigna la mini app
  "Pedir ayuda". Samsung no deja cambiar ese ajuste por ADB. Ver `docs/ANDROID.md`.
- **No abrir "Pedir ayuda" ni `violetcirclevp://sos` para probar** sin un contacto avisado: es la alerta
  real (10 s para cancelar y luego SMS). Para probar usar "Probar sin enviar" dentro de la app.
- **Salir de la calculadora (salida rápida):** escribir el PIN y tocar "=". Igual en web (PIN por navegador).
- La web y el panel comparten dominio: el panel ve la sesión anónima de la web y la trata como "sin sesión".

## Pendiente

0. **Probar con el cel bloqueado** (2026-10-12): botón lateral 2 veces → mini app 1.0.1 → la alerta debe
   encender la pantalla y verse SOBRE el bloqueo con 4 s para cancelar (`SosLockScreenListener` en el módulo).
   Usar un contacto avisado o "Probar sin enviar".

1. **Probar en el cel real**: 3× volumen abajo (servicio de accesibilidad; en Android 13+ requiere
   "Permitir ajustes restringidos"), tecla lateral → mini app, y ambos **con la pantalla bloqueada**.
2. **Confirmar en navegador móvil** que mantener presionado el círculo ya completa los 2 s (arreglo `d7e8ed2`).
3. ~~Texto del botón lateral~~ (hecho en 1.2.0: apunta a la mini app).
4. ~~Instalar la 1.2.0~~ (hecho 2026-10-12). Revisar en el cel: aviso de permisos tras el PIN, chat de Vi
   con el teclado de Samsung, y publicar la web con el rediseño cuando Mario lo apruebe.
   Nota: `expo prebuild` borra `android/local.properties`; recrearlo con `sdk.dir=C:/Users/Mario/AppData/Local/Android/Sdk`.
5. Sembrar el contenido en Firestore (necesita llave de cuenta de servicio); hoy la app usa el JSON incluido.
6. iPhone: sin build todavía (`docs/IPHONE.md`).
- Seguridad: ver `docs/SEGURIDAD.md` (auditoría 2026-10-12). Instalar SIEMPRE primero la app principal y después la mini app (el permiso de firma lo define la principal).
