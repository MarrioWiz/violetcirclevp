# VioletCircleVP en iPhone

Hay cuatro formas de tener la app en un iPhone. Van de la más rápida (para probar) a la más "real" (para instalar como cualquier app).

| Opción | ¿Necesita Mac? | ¿Cuesta? | ¿Sirve sin la compu prendida? | Face ID |
|---|---|---|---|---|
| A. Expo Go | No | Gratis | No | No (usa PIN) |
| B. Build de desarrollo (EAS) | No | Requiere Apple Developer (99 USD/año) | Sí, pero pensada para programar | Sí |
| C. TestFlight (EAS) | No | Requiere Apple Developer (99 USD/año) | Sí | Sí |
| D. PWA (web) | No | Gratis | Sí | No (usa PIN) |

---

## A. Probar con Expo Go (recomendado para clase y desarrollo)

**Qué es:** Expo Go es una app de la App Store que "carga" el código desde tu computadora. No instala VioletCircleVP como app independiente; sirve para probar rápido.

1. En el iPhone, instala **Expo Go** desde la App Store.
2. Conecta la computadora y el iPhone a **la misma red WiFi**.
3. En la computadora, dentro de la carpeta del proyecto:
   ```bash
   cd C:\laragon\www\violetcirclevp
   npm install
   npx expo start
   ```
4. Abre la **Cámara** del iPhone y apunta al código QR que aparece en la terminal. Toca el aviso "Abrir en Expo Go".
5. Si la red de la escuela bloquea la conexión, usa: `npx expo start --tunnel`.

> La computadora debe estar encendida y con `npx expo start` corriendo mientras pruebas.

## B. Build de desarrollo con EAS (opcional)

**Qué es:** una versión de la app instalada de verdad en tu iPhone, pero que todavía se conecta a la computadora para recargar cambios. Sirve para probar Face ID y funciones que Expo Go no tiene.

1. Crea una cuenta gratis en https://expo.dev/signup.
2. Instala la herramienta y entra:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```
3. Instala el cliente de desarrollo: `npx expo install expo-dev-client`
4. Registra tu iPhone: `eas device:create` (te da un enlace para abrir en el iPhone).
5. Compila en la nube: `eas build -p ios --profile development`
6. Cuando termine, abre el enlace en el iPhone e instala.

Requiere estar en el **Apple Developer Program** (99 USD al año).

## C. TestFlight (instalar como app "real")

**Qué es:** TestFlight es la app oficial de Apple para probar apps antes de publicarlas. Cualquier persona invitada la instala desde TestFlight sin necesidad de la computadora.

Requisitos:
- Cuenta de **Apple Developer Program** activa (99 USD/año) — https://developer.apple.com/programs/
- Identificador de la app (bundle identifier): `mx.uvp.violetcirclevp` (ya está en `app.config.ts`; si Apple dice que ya existe, cámbialo, por ejemplo `mx.uvp7c.violetcirclevp`).
- Los textos de permisos ya están en español en `app.config.ts` (contactos, ubicación, fotos, cámara, Face ID).

Pasos:
1. `eas login`
2. `eas build -p ios --profile production` — EAS te pedirá iniciar sesión con tu Apple ID y crea los certificados automáticamente.
3. `eas submit -p ios --latest` — sube la compilación a App Store Connect.
4. En https://appstoreconnect.apple.com → tu app → **TestFlight**, agrega personas evaluadoras (correo).
5. Ellas instalan **TestFlight** desde la App Store y aceptan la invitación.

La primera revisión de TestFlight externa puede tardar 1–2 días.

## D. Alternativa gratis: PWA (página web instalable)

**Qué es:** la misma app como página web que se "agrega a la pantalla de inicio" desde Safari. No requiere cuenta de Apple.

1. Genera la versión web: `npx expo export -p web` (crea la carpeta `dist/`).
2. Publícala en Firebase Hosting (ya configurado en `firebase.json`):
   ```bash
   firebase deploy --only hosting --project <tu-proyecto>
   ```
3. En el iPhone abre la URL en **Safari** → botón Compartir → **Agregar a pantalla de inicio**.

Limitaciones de la PWA:
- No hay almacenamiento seguro del sistema (Keychain): la llave de cifrado se guarda en el navegador. Es menos protegido que la app nativa.
- No se pueden adjuntar archivos a la bitácora ni abrir el compositor de SMS.
- Si se borran los datos de Safari, se borran los datos de la app.

## ¿Qué cambia entre Expo Go y una build real?

| Función | Expo Go | Build de desarrollo / TestFlight |
|---|---|---|
| Face ID | No disponible (iOS no da permiso a Expo Go). La app usa solo el PIN. | Sí |
| Notificaciones push remotas | No | Sí (la app no las usa; solo recordatorios locales) |
| Recordatorios locales | Sí | Sí |
| Nombre e ícono propios | No (aparece "Expo Go") | Sí |
| Ícono alterno discreto (fase 3) | No | Sí |
| Funciona sin la computadora | No | Sí |

## Reemplazar ícono y splash con los logos finales

Los archivos actuales son provisionales (generados con el símbolo de escudo y círculo):

| Archivo | Tamaño | Notas |
|---|---|---|
| `assets/images/icon.png` | 1024×1024 | **Sin transparencia** (Apple la rechaza) |
| `assets/images/splash-icon.png` | 1024×1024 | Fondo transparente; se muestra centrado |
| `assets/images/android-icon-foreground.png` | 1024×1024 | El símbolo dentro del 66 % central |
| `assets/images/android-icon-background.png` | 1024×1024 | Color sólido |
| `assets/images/android-icon-monochrome.png` | 1024×1024 | Blanco sobre transparente |
| `assets/images/favicon.png` | 48×48 | Para la PWA |

Reemplaza los archivos con el mismo nombre y tamaño, y vuelve a correr `npx expo start -c` (la `-c` limpia la caché).
