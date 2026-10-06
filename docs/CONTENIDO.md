# Contenido: fuentes, estado de revisión y pendientes

Todo el contenido inicial está marcado `"reviewStatus": "borrador"`. El equipo debe revisarlo antes de presentarlo como información oficial.

## Archivos

| Archivo | Contenido | Estado |
|---|---|---|
| `assets/content/triage.json` | Árbol de orientación (7 preguntas, 9 resultados, 4 consejos contextuales) | borrador |
| `assets/content/guides.json` | 3 guías de primeros pasos, 1 de rutas formales, 5 por plataforma | borrador |
| `assets/content/articles.json` | 10 artículos + autoevaluación (10 preguntas, 3 niveles) | borrador |
| `assets/content/directory.json` | 1 entrada verificada (911) + 8 plantillas `PENDIENTE_DE_VERIFICAR` | borrador |
| `assets/content/templates.json` | 4 plantillas de mensajes para el círculo | borrador |
| `assets/content/legal.json` | Aviso de privacidad, Acerca de, "Cómo acompañar" | borrador |

## Fuentes de partida

- ONU Mujeres, *Guía básica: qué hacer ante la violencia digital* — base para "Conservar evidencia", "Evitar acciones que aumenten el riesgo" y los resultados de la orientación.
- INEGI, *Módulo sobre Ciberacoso (MOCIBA) 2024* — cifra citada en el artículo "Ciberacoso" (22.2 % de mujeres usuarias de 12+ años).
- INEGI, *ENDIREH 2021* — contexto del proyecto (violencia en el ámbito escolar).
- Centros de ayuda oficiales de WhatsApp, Instagram/Meta, TikTok y Google — rutas de menús en las guías por plataforma (los menús cambian; cada guía muestra su fecha de revisión).

**Regla:** no se inventaron cifras, leyes ni teléfonos. La guía "Rutas formales" describe el proceso de forma general y avisa que está pendiente de verificación.

## Pendientes de verificación (directorio)

Para publicar una entrada: confirmar con la fuente oficial, llenar todos los campos, poner `verified: true`, `verifiedAt` (AAAA-MM-DD) y `source`. La app oculta cualquier entrada que tenga un campo `PENDIENTE_DE_VERIFICAR` aunque diga `verified: true`.

- [ ] Policía cibernética de Puebla — teléfono, sitio, horario, qué esperar.
- [ ] Fiscalía General del Estado de Puebla — teléfono, dirección de la unidad que recibe denuncias de delitos digitales / contra mujeres, horario.
- [ ] Instituto Poblano de las Mujeres — teléfono, sitio, dirección, horario.
- [ ] Línea nacional de atención a mujeres — nombre exacto, teléfono, horario.
- [ ] Línea de apoyo psicológico — institución, teléfono, horario.
- [ ] Asesoría jurídica gratuita en Puebla — institución, teléfono, horario.
- [ ] Instancia de atención y género de la UVP — nombre oficial, correo, extensión, ubicación en campus.
- [ ] Atención psicopedagógica UVP — contacto y horario.

## Pendientes de revisión de texto

- [ ] Rutas formales: confirmar con fuente legal el proceso de denuncia en Puebla y los derechos de la víctima (redactar con lenguaje llano).
- [ ] Mención general de que la difusión de contenido íntimo sin consentimiento es una conducta sancionada: confirmar referencia legal (reformas conocidas como "Ley Olimpia") antes de citarla explícitamente.
- [ ] Guías por plataforma: revisar las rutas de menú en un teléfono real y actualizar `lastReviewed`.
- [ ] Definir correo del equipo para "Enviar comentarios" (`FEEDBACK_EMAIL` en `src/app/(app)/ajustes/index.tsx`).
- [ ] Revisión de tono con perspectiva de género y enfoque trauma-informed por al menos una persona del equipo que no haya escrito el texto.

## Cómo actualizar contenido sin publicar una nueva versión

1. Edita el JSON en `assets/content/`.
2. Corre `node firebase/seed/seed.mjs` (ver instrucciones dentro del archivo).
3. La app descarga el contenido nuevo al abrirse con internet y lo guarda para usarlo sin conexión.
