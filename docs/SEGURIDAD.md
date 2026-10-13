# Seguridad de VioletCircleVP — auditoría (2026-10-12)

Revisión con base en el OWASP Mobile Top 10 (2024) y ataques comunes a apps de este tipo.

## Qué se encontró y se corrigió

| Riesgo | Antes | Ahora |
|---|---|---|
| **Activar la alerta desde fuera** (enlace `violetcirclevp://sos` por WhatsApp o desde otra app) | Cualquier enlace o app abría la cuenta regresiva y, si no se cancelaba, mandaba el SMS con la ubicación | Los disparadores propios llevan una **clave secreta por instalación** (`SosToken`, 192 bits, comparación en tiempo constante). Sin clave, el enlace abre la app normal, sin alerta (`+native-intent.tsx`) y sin mostrarse sobre el bloqueo (`SosLockScreenListener`) |
| **Mini app suplantada** | Abría la alerta por enlace público | Entra por `SosEntryActivity`, protegida con el permiso `mx.uvp.violetcirclevp.permission.TRIGGER_SOS` (**protectionLevel=signature**): solo apps firmadas con nuestra llave |
| **Entrada "Pedir ayuda" del menú de apps** (exportada) | Cualquier app podía abrirla si estaba activada | Siempre desactivada (`disableLauncherEntry`); el botón lateral usa la mini app |
| **Adivinar el PIN** | 5 intentos y 30 s fijos; cerrar la app reiniciaba la espera | Esperas crecientes (30 s → 1 min → 5 min → 15 min → 1 h) guardadas en el teléfono |
| **Adivinar el PIN en la calculadora** | Sin límite | Cuenta intentos y respeta la misma espera (la calculadora sigue funcionando) |
| **Respaldos en la nube** | `allowBackup=true` (datos cifrados, pero salían del teléfono) | `allowBackup=false` |
| **Enlaces con esquemas raros** | `openExternalUrl` abría cualquier esquema | Solo `https`, `http`, `mailto`, `tel` |
| **Web** | HSTS, nosniff, no-referrer, X-Frame-Options | + `Permissions-Policy` (solo ubicación) y CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'self'` |
| **Dependencias** | Parches de SDK 57 atrasados | Actualizadas (`expo install --fix`). Las alertas de `npm audit` restantes son de herramientas de compilación (CLI, Metro, Jest) que no van en el APK |

## Lo que ya estaba bien

- **Datos cifrados** (círculo, registros, evidencia) con AES-256-GCM; la llave vive en el Keystore de Android vía SecureStore. Nada sensible se sube a internet.
- **Firestore**: nadie puede escribir contenido; el directorio solo devuelve lo verificado; las estadísticas aceptan exactamente 3 campos anónimos y solo el correo del equipo las lee (17 pruebas de reglas).
- **Servicio de accesibilidad** mínimo: `canRetrieveWindowContent=false`, solo filtra la tecla de bajar volumen.
- **APK release**: no depurable, sin tráfico sin cifrar, minificado con R8, firmado con la llave propia (otra persona no puede publicar una "actualización").
- **Privacidad en pantalla**: capa de privacidad en el selector de apps, bloqueo de capturas (FLAG_SECURE) con "Ocultar vista previa", salida rápida a calculadora.
- Sin `console.log` con datos, sin secretos en git (`.env`, `keystore/`, `release/` ignorados).

## Riesgos que quedan (y por qué)

- **Teléfono con root o malware con privilegios**: puede leer cualquier app; fuera del alcance de una app.
- **Alguien que conoce tu PIN del teléfono y el de la app**: protección física; usar un PIN de la app distinto al del teléfono.
- **Web en el navegador**: la llave de cifrado vive en el almacenamiento del navegador (más débil que el Keystore). La app de Android es la opción más segura (ya documentado en `PRIVACIDAD.md`).
- **El PDF exportado no va cifrado** (la app lo advierte antes de compartir).
- **Estadísticas anónimas**: alguien con la llave pública de Firebase podría crear estadísticas falsas (no expone datos). Mitigación futura: Firebase App Check.
