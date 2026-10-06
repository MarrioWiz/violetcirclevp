# VioletCircleVP

Plataforma de acompañamiento y seguridad digital para mujeres universitarias de la UVP: **identificar** si lo que pasa es violencia digital, **documentarlo**, **recibir orientación** y **activar un círculo de confianza**.

Proyecto integrador — Problemática Social Contemporánea, 7.º semestre, grupo 7C, Ingeniería en Sistemas y Tecnologías de la Información, Universidad del Valle de Puebla.

> **No es un servicio de emergencia.** No sustituye una denuncia formal, atención psicológica, asesoría jurídica ni a las autoridades. En peligro inmediato: **911**.

## Stack

React Native + Expo SDK 57 · TypeScript estricto · Expo Router · Firebase JS SDK (Auth anónima + Firestore) · Zustand · react-hook-form + zod · date-fns · lucide-react-native · Reanimated. Build nativa local (Android Studio/Gradle); iPhone con EAS/TestFlight o PWA.

## Empezar

```bash
npm install
cp .env.example .env      # configuración de Firebase (proyecto violetcirclevp-uvp)
npx expo run:android      # desarrollo en un teléfono/emulador conectado
npm run android:release   # APK release (ver docs/ANDROID.md)
```

| Script | Para qué |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm test` | Pruebas unitarias y de accesibilidad (Jest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config de Expo) |
| `npm run format` | Prettier |
| `npm run test:rules` | Pruebas de reglas de Firestore con el emulador |
| `npm run android:release` | APK release firmado |
| `npm run build:web` | PWA + panel de tendencias en `dist/` |

## Estructura

```
src/app/              rutas (Expo Router)
  (onboarding)/       bienvenida, consentimiento, crear-pin, primer-circulo, estadisticas
  (app)/(tabs)/       Inicio, Orientación, Mi círculo, Directorio, Más
  (app)/alerta        alerta rápida (modal)
  (app)/guia, directorio, circulo, bitacora, aprende, ajustes, info
src/components/       UI reutilizable (Button, Card, Screen, PinPad, QuickExitButton, EmergencyBanner…)
src/features/         lógica por módulo (auth, triage, circle, evidence, directory, content, settings, stats)
src/services/         firebase, crypto (AES-GCM + SHA-256), secureStore, storage, evidenceFiles, pdf, notifications
src/store/            Zustand (settings, session, circle, incidents, checklist, content)
src/theme/            colores (claro/oscuro), tipografía, espaciado
src/lib/strings.es.ts todos los textos de la interfaz (es-MX)
assets/content/       contenido empaquetado (borradores): árbol, guías, artículos, directorio, plantillas, avisos
firebase/             reglas de Firestore, índices, script de seed
docs/                 DECISIONES, IPHONE, PRIVACIDAD, V-DE-GOWIN, CONTENIDO
```

## Firebase (opcional)

1. Crea un proyecto en https://console.firebase.google.com (plan Spark, gratis).
2. **Authentication → Sign-in method → Anónimo → Habilitar.**
3. **Firestore Database → Crear base de datos** (modo producción).
4. **Configuración del proyecto → Tus apps → Web (</>)** → copia la configuración en `.env`.
5. Despliega las reglas: `firebase deploy --only firestore:rules --project <id>`.
6. Sube el contenido: ver `firebase/seed/seed.mjs`.

## Documentación

- [docs/ANDROID.md](docs/ANDROID.md) — APK release, firma e instalación.
- [docs/IPHONE.md](docs/IPHONE.md) — TestFlight y PWA.
- [docs/PRIVACIDAD.md](docs/PRIVACIDAD.md) — qué se guarda, dónde y cómo borrarlo.
- [docs/V-DE-GOWIN.md](docs/V-DE-GOWIN.md) — trazabilidad para la presentación.
- [docs/DECISIONES.md](docs/DECISIONES.md) — decisiones técnicas.
- [docs/CONTENIDO.md](docs/CONTENIDO.md) — fuentes y pendientes de verificación.
