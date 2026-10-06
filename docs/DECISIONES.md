# Decisiones técnicas y supuestos — VioletCircleVP

## Plan técnico (resumen)

1. **Expo SDK 57 + TypeScript estricto + Expo Router.** Las rutas viven en `src/app/` (convención por defecto de la plantilla SDK 57) en lugar de `app/` en la raíz; el resto de la estructura (`src/components`, `src/features`, `src/services`…) sigue el documento.
2. **Todo corre en Expo Go**: solo se usan módulos incluidos en Expo Go (secure-store, crypto, local-authentication, contacts, sms, location, image-picker, document-picker, file-system, print, sharing, notifications, haptics, clipboard).
3. **Cifrado local con AES-256-GCM nativo de `expo-crypto`** (`aesEncryptAsync`/`aesDecryptAsync`, disponibles en Expo Go desde SDK 55+). La llave maestra se genera en el dispositivo y vive solo en `expo-secure-store` (Keychain en iPhone).
4. **Almacenamiento local**: los datos sensibles (círculo, bitácora, avances de checklists) se guardan como JSON **cifrado** en AsyncStorage (un registro por colección). Se descartó `expo-sqlite` porque el volumen es pequeño (≤ 5 contactos, decenas de entradas) y porque en web/PWA requiere WebAssembly y cabeceras especiales. Los archivos de evidencia irán a `Paths.document/evidence/` (fase 2).
5. **Firebase JS SDK modular** (no `react-native-firebase`): Auth anónima + Firestore solo para contenido institucional, directorio verificado y estadísticas anónimas. Firestore usa long-polling en nativo (el streaming por defecto falla con Hermes).
6. **La app funciona sin Firebase.** Si `.env` no tiene las claves, la app usa el contenido empaquetado en `assets/content/*.json`. Firebase es una mejora (actualizar contenido sin publicar nueva versión), no un requisito.
7. **Estado** con Zustand; los stores sensibles se hidratan desde el almacenamiento cifrado al desbloquear.
8. **Bloqueo**: PIN propio (4–6 dígitos) guardado como `SHA-256(salt + PIN)` en SecureStore + biometría opcional. Tras 5 intentos fallidos hay espera de 30 s. El bloqueo se dibuja como capa sobre la navegación (no como ruta), así nunca se ve contenido debajo.
9. **Pantalla de privacidad**: cuando la app deja de estar activa (`AppState` ≠ `active`) se dibuja una capa violeta con el logo, de modo que el app switcher no muestre contenido.
10. **Salida rápida**: en vez de una ruta `salida-rapida.tsx` que se agrega al historial, el layout raíz **desmonta toda la navegación** y muestra una calculadora funcional. Así el historial se borra de verdad (no hay "atrás"). Para volver: escribir el PIN en la calculadora y tocar `=`. El estado "disfrazado" se guarda, así que si cierran y abren la app vuelve a aparecer la calculadora.
11. **Alerta rápida**: Inicio → "Necesito ayuda ahora" (1) → "Avisar a mi círculo" (2) → "Abrir Mensajes" (3). Se usa `expo-sms` (abre el compositor con el texto listo) o `https://wa.me/?text=` (WhatsApp, elige destinatarias ella). Nunca se envía nada automáticamente.
12. **Ubicación aproximada**: se redondea a 3 decimales (~100 m) y solo si ella activa el interruptor en ese momento. No se guarda.
13. **Árbol "¿Esto es violencia digital?"** declarativo en `assets/content/triage.json` (nodos + resultados) y un motor puro en `src/features/triage/engine.ts` con tests.
14. **Directorio**: doble filtro de `verified === true` (reglas de Firestore + filtro en cliente). El único dato fijo verificado es el 911.
15. **Tipografía**: Plus Jakarta Sans (títulos) + Inter (cuerpo). Se respeta Dynamic Type (escalado del sistema) y además hay un ajuste propio de tamaño de texto.
16. **Sin analítica de terceros**, sin `console.log` con datos personales.
17. **Pruebas**: Jest (`jest-expo`) para motor del árbol, cifrado/hash, mensajes del círculo y filtro del directorio.

## Supuestos

- La usuaria tiene iPhone con iOS reciente y Expo Go instalado para desarrollo.
- El equipo verificará teléfonos e instituciones antes de marcarlos `verified: true`.
- Todo el contenido inicial es **borrador** (`reviewStatus: "borrador"`).

## Decisiones tomadas por privacidad (prioridad sobre el documento)

- **Las estadísticas anónimas no se ligan a la sesión**: aunque la regla exige `signedIn()`, el documento no lleva UID. Firestore no expone quién lo escribió a otras usuarias.
- **No se registra el uso de la alerta en la nube**, solo en la bitácora local.
- **Web/PWA**: SecureStore no existe en navegador; la llave maestra se guarda en el almacenamiento del navegador (protección menor). Se avisa en `docs/IPHONE.md` y `docs/PRIVACIDAD.md`; la experiencia recomendada es la app nativa.

## Decisiones tomadas durante la construcción

- **Rutas en grupos protegidos**: `(onboarding)` y `(app)` con `Stack.Protected`. Mientras no termine el onboarding no se puede abrir ninguna pantalla de la app, ni por enlace.
- **Bloqueo como capa**: la navegación sigue montada debajo (oculta a VoiceOver) para que al desbloquear vuelva a donde estaba; la salida rápida sí desmonta todo.
- **Evidencia cifrada en disco**: además de los datos, los archivos se guardan cifrados (`.enc`). El SHA-256 se calcula sobre el archivo original, y "Compartir archivo original" lo descifra temporalmente para que el hash coincida. Límite de 15 MB por archivo (el cifrado en JS de archivos grandes es lento).
- **Entradas bloqueadas** de la bitácora piden de nuevo el PIN de la app (no un segundo PIN, para no obligar a recordar dos).
- **Editar no sobrescribe en silencio**: cada cambio de descripción o notas guarda la versión anterior (máximo 20).
- **Compartir texto** ("Cómo acompañar") usa `Share` de React Native; `expo-sharing` solo comparte archivos (se usa para PDF, JSON y evidencia).
- **Contenido en Firestore**: guías y artículos viven juntos en `content/{slug}` con un campo `kind: 'guide' | 'article'`; mantienen la misma forma que los JSON empaquetados (con `sections` en lugar de `steps[]`) para que una sola pantalla sirva para ambos orígenes.
- **Directorio con doble candado**: además de `verified`, la app oculta entradas sin `source`, sin `verifiedAt` o con cualquier campo `PENDIENTE_DE_VERIFICAR`.
- **Alerta rápida en 3 toques**: (1) "Necesito ayuda ahora" → (2) "Avisar a mi círculo" → (3) "Abrir Mensajes". Todas las personas del círculo vienen preseleccionadas.
- **WhatsApp**: con una sola persona elegida se abre su chat; con varias, WhatsApp pide elegir el chat (no permite varios destinatarios por enlace).
- **Respiración** opcional (botón "Respira conmigo"), para no retrasar a quien tiene prisa; respeta "Reducir movimiento".
- **Salida rápida en onboarding**: no se muestra hasta que existe un PIN (sin PIN no habría forma de volver de la calculadora).
- **Correo de comentarios**: queda vacío (`FEEDBACK_EMAIL`) hasta que el equipo defina uno.

## Librerías y Expo Go

| Librería | ¿Funciona en Expo Go? | Nota |
|---|---|---|
| Face ID (`expo-local-authentication`) | Parcial | En Expo Go (iOS) no hay permiso de Face ID para la app; cae al código del teléfono. Por eso existe el PIN propio. |
| `expo-notifications` | Solo locales | Push remoto requiere build de desarrollo. Solo usamos recordatorios locales. |
| Ícono alterno discreto | No | Requiere build de desarrollo (fase 3). |
