# VioletCircleVP en iPhone

La app no usa Expo Go. Para iPhone hay dos caminos:

| Opción | ¿Necesita Mac? | ¿Cuesta? | Face ID | Ícono discreto |
|---|---|---|---|---|
| A. TestFlight (build nativa con EAS) | No | Apple Developer Program, 99 USD/año | Sí | Sí |
| B. PWA (página web instalable) | No | Gratis | No (usa PIN) | No |

Para Android ver [ANDROID.md](ANDROID.md) (APK release local, gratis).

---

## A. TestFlight (app nativa)

**Qué es:** EAS compila la app de iPhone en la nube (no hace falta Mac) y TestFlight, la app oficial de Apple, permite instalarla a las personas invitadas.

Requisitos:
- Cuenta de **Apple Developer Program** activa — https://developer.apple.com/programs/
- Cuenta gratuita de Expo — https://expo.dev/signup
- Identificador de la app: `mx.uvp.violetcirclevp` (en `app.config.ts`; si Apple dice que ya existe, cámbialo, p. ej. `mx.uvp7c.violetcirclevp`).
- Los textos de permisos ya están en español (contactos, ubicación, fotos, cámara, Face ID).

Pasos:
1. `npm install -g eas-cli`
2. `eas login`
3. `eas build:configure`
4. Copia las variables de `.env` como secretos de EAS: `eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value <valor>` (repite para cada una).
5. `eas build -p ios --profile production` — EAS pide tu Apple ID y crea los certificados.
6. `eas submit -p ios --latest` — sube la compilación a App Store Connect.
7. En https://appstoreconnect.apple.com → la app → **TestFlight**, invita por correo a quien vaya a probarla.
8. Esas personas instalan **TestFlight** desde la App Store y aceptan la invitación.

La primera revisión de TestFlight externa puede tardar 1–2 días.

Nota: en iPhone no se pueden bloquear las capturas de pantalla (Apple no lo permite); la app sí tapa el contenido en el selector de apps y en grabaciones de pantalla.

## B. PWA (gratis, sin cuenta de Apple)

1. `npm run build:web` (genera `dist/` con la app web y el panel).
2. `firebase deploy --only hosting`
3. En el iPhone abre la URL en **Safari** → Compartir → **Agregar a pantalla de inicio**.

Limitaciones de la PWA:
- No hay almacenamiento seguro del sistema (Keychain): la llave de cifrado queda en el navegador. Es menos protegida que la app nativa.
- No se pueden adjuntar archivos a la bitácora ni abrir el compositor de SMS.
- Si se borran los datos de Safari, se borran los datos de la app.

## Reemplazar ícono y splash con los logos finales

| Archivo | Tamaño | Notas |
|---|---|---|
| `assets/images/icon.png` | 1024×1024 | **Sin transparencia** (Apple la rechaza) |
| `assets/images/splash-icon.png` | 1024×1024 | Fondo transparente; se muestra centrado |
| `assets/images/android-icon-foreground.png` | 1024×1024 | El símbolo dentro del 66 % central |
| `assets/images/android-icon-background.png` | 1024×1024 | Color sólido |
| `assets/images/android-icon-monochrome.png` | 1024×1024 | Blanco sobre transparente |
| `assets/images/icon-calculadora*.png` | 1024×1024 | Ícono discreto |
| `assets/images/favicon.png` | 48×48 | Para la PWA |

Después de reemplazarlos: `npx expo prebuild --clean` y vuelve a compilar.
