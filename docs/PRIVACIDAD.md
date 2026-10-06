# Privacidad en VioletCircleVP

Principio: **lo sensible nunca sale del teléfono**. Firebase solo ve contenido público (guías, directorio) y, si ella lo permite, estadísticas anónimas.

## Qué se guarda y dónde

| Dato | Dónde | Protección |
|---|---|---|
| PIN | SecureStore (Keychain / Keystore) | Solo el hash `SHA-256(sal + PIN)`, nunca el número. Sal aleatoria de 16 bytes. |
| Llave maestra AES-256 | SecureStore, `WHEN_UNLOCKED_THIS_DEVICE_ONLY` | No viaja en respaldos de iCloud a otros equipos. |
| Círculo de confianza | AsyncStorage (`vcvp.enc.circle`) | Cifrado AES-256-GCM. |
| Bitácora (incidentes) | AsyncStorage (`vcvp.enc.incidents`) | Cifrado AES-256-GCM. |
| Metadatos de evidencia (nombre, hash, fecha) | AsyncStorage (`vcvp.enc.evidence`) | Cifrado AES-256-GCM. |
| Archivos de evidencia | `Documents/evidence/<uuid>.enc` | Cifrados AES-256-GCM; el SHA-256 se calcula sobre el archivo **original**. |
| Avances de listas y favoritos | AsyncStorage (`vcvp.enc.checklists`) | Cifrado AES-256-GCM. |
| Ajustes (tema, bloqueo, opt-in) | AsyncStorage (`vcvp.settings`) | Sin cifrar: no contienen nada del incidente. |
| Caché de contenido público | AsyncStorage (`vcvp.content-cache`) | Sin cifrar: es contenido institucional. |
| Sesión anónima de Firebase | AsyncStorage (`firebase:*`) | Sin nombre, correo ni teléfono. |

En la versión web (PWA) no existe SecureStore: la llave se guarda en el almacenamiento del navegador. Por eso la PWA es menos segura que la app nativa y no permite adjuntar evidencia.

## Qué NO se envía nunca

- Contactos del círculo, teléfonos.
- Bitácora, evidencia, descripciones.
- Respuestas de "¿Esto es violencia digital?".
- Ubicación (solo se agrega al texto del mensaje si ella lo activa en ese momento; no se guarda).
- Registro de uso de la alerta rápida (queda solo en la bitácora local).

## Qué se envía a Firebase

1. **Lectura** de `content/*`, `directory/*` (solo `verified == true`) y `config/app`, con una sesión anónima.
2. **Solo si ella activa "Estadísticas anónimas"**: al terminar la orientación guiada se crea un documento en `stats/` con este esquema exacto:

```json
{ "kind": "ciberacoso", "platform": "instagram", "week": "2026-W41" }
```

- `kind`: uno de `riesgo, ciberacoso, sextorsion, doxing, suplantacion, difusion, grooming, amenazas, otro`.
- `platform`: uno de `whatsapp, instagram, tiktok, facebook, otra`.
- `week`: semana ISO (`AAAA-Www`), nunca la fecha exacta.
- Solo el equipo autorizado (correos en `isTeam()` de las reglas, con inicio de sesión de Google) puede leerlas, desde el panel `/panel`. El panel oculta cifras menores a 3.
- **Sin** UID, sin ubicación, sin texto libre. Las reglas de Firestore rechazan cualquier otro campo y nadie puede leer `stats/` desde la app.

## Bloqueo y discreción

- PIN propio de 4–6 dígitos; se rechazan PIN triviales (`0000`, `1234`).
- 5 intentos fallidos → pausa de 30 s.
- Biometría opcional (Face ID / huella) en builds reales.
- Bloqueo automático al ir a segundo plano: inmediato (por defecto), 1 min o 5 min.
- Capa de privacidad al dejar de estar activa: el selector de apps no muestra contenido.
- Android: con "Ocultar vista previa" activo se bloquean las capturas de pantalla dentro de la app y la miniatura de "Recientes" sale en negro (FLAG_SECURE).
- Ícono discreto opcional: la app puede aparecer como "Calculadora" en el teléfono.
- Ubicación: Android solo tiene permiso de ubicación **aproximada**; la precisa y la de segundo plano están bloqueadas.
- **Salida rápida**: muestra una calculadora funcional y borra el historial de navegación. Para volver: escribir el PIN y tocar `=`.
- Notificaciones discretas: título "Recordatorio", sin mencionar la app ni el tema.
- Entradas de bitácora con PIN extra opcional.
- Sin analítica de terceros, sin publicidad, sin `console.log` con datos personales.

## Cómo borrarlo todo

**Ajustes → Borrar todos mis datos** (doble confirmación). También disponible desde la pantalla de bloqueo ("¿Olvidaste tu PIN?"). Hace, en orden:

1. Elimina la cuenta anónima de Firebase.
2. Cancela recordatorios programados.
3. Borra la carpeta `Documents/evidence/`.
4. Borra todas las claves `vcvp.*` y `firebase:*` de AsyncStorage.
5. Borra PIN, sal y llave maestra de SecureStore (sin llave, cualquier copia cifrada queda ilegible).
6. Reinicia la app al onboarding.

Las estadísticas anónimas ya enviadas no se pueden borrar porque no están ligadas a ninguna persona.

## Exportar mis datos

- **Ajustes → Exportar mis datos**: JSON con círculo, bitácora y metadatos de evidencia (sin cifrar; se advierte antes).
- **Bitácora → Exportar PDF**: expediente con cronología, miniaturas y hashes (sin cifrar; se advierte antes).
- **Compartir archivo original** de cada evidencia: se descifra temporalmente para que su SHA-256 coincida con el registrado; el archivo temporal se borra al terminar.
