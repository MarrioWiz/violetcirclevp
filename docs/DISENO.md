# Sistema visual de VioletCircleVP — "dock líquido"

Rediseño solo de presentación (2026-10-06). No cambia rutas, datos, servicios, reglas de Firebase, avisos de alcance, 911, salida rápida ni el PIN.

## 1. Auditoría inicial (antes del rediseño)

| Hallazgo | Dónde | Problema |
|---|---|---|
| Colores literales (`#hex`, `rgba`) | `Logo`, `SosScreen`, `HoldToHelpOrb`, `DisguiseCalculator`, `bienvenida`, `IconBadge`, `Button`, `PrivacyCover`, Inicio, Círculo | 40 literales fuera de `src/theme/` |
| Bordes gruesos / sólidos de color | `Button` (1.5 px de color), `TextField` (1.5 px, rojo en error), `CheckRow` (2 px), `CircleComposer` (1.5 px violeta al seleccionar), chips | 14 `borderWidth` sueltos, varios de 1.5–2 px |
| Sombras duras | `Card`, Inicio (héroe), `Segmented` | 15 `shadow*`/`elevation`; en Android no se tiñen |
| Radios mezclados | 10, 16, 20, 28, 38, 999 y valores a mano (`borderRadius: 22`, `28`) | 15 radios literales, sin relación concéntrica |
| Tipografía | Plus Jakarta Sans + Inter; títulos 24 pt | Sin jerarquía "display"; sin mono para metadatos |
| Tab bar | Tabs por defecto de React Navigation | Plano, sin acento por sección |
| Tema claro + oscuro | `colors.ts` | Dos paletas que divergen; el oscuro era secundario |

## 2. Decisiones

- **Un solo tema: oscuro.** El documento permite dejar oscuro como único tema; se quitó el selector de tema en Ajustes (se conserva el tamaño de texto).
- **Acento por sección** (Inicio lavanda, Orientación cian, Círculo rosa, Directorio menta, Más ámbar). Lo fija el dock y lo heredan las pantallas abiertas desde esa pestaña.
- **Tipografía:** Inter (400–800) + JetBrains Mono 500 para "eyebrows", etiquetas y metadatos.
- **Bordes:** un solo tipo, 1 px translúcido (`stroke` / `strokeStrong`). Sin bordes de color sólido (salvo el tinte `danger` al 35 % de la franja del 911).
- **Resplandores con SVG** (`RadialGradient`), no con `shadow*`.
- **Excepciones de color literal permitidas** (documentadas en el tema): la calculadora de salida rápida (debe parecer otra app) y el logo; ambas toman sus colores de `src/theme/colors.ts` (`disguise`, `brand`).

## 3. Tokens

Ver `src/theme/colors.ts`, `typography.ts`, `spacing.ts`.

## 4. Componentes

| Componente | Archivo | Uso |
|---|---|---|
| `Backdrop` | `components/ui/Backdrop.tsx` | Fondo `bg0` + radial violeta arriba + resplandor del acento abajo |
| `Screen` | `components/Screen.tsx` | Safe areas, fondo, encabezado grande que se contrae al hacer scroll, `paddingBottom` del dock |
| `ScreenHeader` | `components/ui/ScreenHeader.tsx` | Eyebrow mono + título gigante + subtítulo |
| `Dock` | `components/dock/Dock.tsx` | Tab bar líquido con perla, muesca y hombros tangentes |
| `Card` (GlassCard) | `components/Card.tsx` | Vidrio, borde hairline, brillo superior |
| `FileCard` | `components/ui/FileCard.tsx` | Tarjeta tipo "archivo" con cabecera mono |
| `Button`, `Chip`, `TextField`, `ListRow`, `ToggleRow`, `CheckRow`, `Segmented` | `components/` | Kit migrado a vidrio |
| `Avatar`, `VerifiedBadge` | `components/ui/` | Círculo y directorio |

## 5. Cómo agregar una pestaña con su acento

1. Agrega el acento en `accents` (`src/theme/colors.ts`) y su entrada en `TAB_META` (`src/components/dock/tabs.ts`).
2. Crea la ruta en `src/app/(app)/(tabs)/` y regístrala en `_layout.tsx`.
3. El dock reparte las posiciones automáticamente entre `cxMin` y `W − cxMin`.

## 6. Resultado de la auditoría final

| Revisión | Resultado |
|---|---|
| Colores literales fuera de `src/theme/` | 0 |
| Sombras (`shadow*` / `elevation`) | 0 (resplandores con SVG) |
| Bordes | Todos de 1 px translúcidos; única excepción: el halo de 3 px de los puntos de la línea de tiempo de la bitácora (decorativo, translúcido) |
| Fuentes escritas a mano | 0 (todo vía `fonts`) |
| `tsc --noEmit`, lint, pruebas | En verde (49 pruebas) |

## 7. Revisión visual (emulador Android, 1080×1920, 420 dpi)

- Dock: muesca con hombros tangentes sin picos en las 5 posiciones; perla y etiqueta cambian de acento (lavanda, cian, rosa, menta, ámbar); halo inferior del acento.
- Inicio: orbe de 168 pt con anillos que "respiran" (pausados fuera de Inicio, con la app bloqueada o con "Reducir movimiento").
- Bitácora: línea de tiempo con tarjetas tipo archivo.
- PIN: círculos de vidrio de 72 pt; puntos que se llenan con el acento y sacudida suave al fallar.
- "Pedir ayuda": anillo de cuenta regresiva, número gigante y "Cancelar, no enviar" grande.

Pendiente de revisar en iPhone (cuando haya build): home indicator, Dynamic Type grande y VoiceOver sobre el dock.

## 8. Rediseño de UX (2026-10-12, v1.2.0)

Pedido de Mario: pantallas saturadas, rutas duplicadas, permisos sin pedir y colores muy fuertes. El **dock no se tocó** (estilo, posición, pestañas); solo hereda la paleta suavizada.

**Regla:** cada función tiene UNA entrada de menú. Se permiten botones de acción dentro de un flujo crítico (p. ej. "Avisar a mi círculo" en el resultado de Orienta).

| Pantalla | Acción principal | Cambio |
|---|---|---|
| Onboarding | — | 1 Permisos → 2 Bienvenida → 3 Privacidad → 4 PIN → **5 Salida rápida** → 6 Círculo → 7 Estadísticas |
| Aviso tras el PIN (`features/permissions/SetupGate`) | Permitir | Solo si falta ubicación (y SMS en Android) o no se vio la guía de salida rápida; "Ahora no" vale por sesión |
| Inicio | Orbe "Pedir ayuda" | Sin mosaicos; una línea "Ayuda lista / Falta un paso" (`features/sos/ReadinessRow`) + 911 |
| Orienta | Responder | Tarjetas, una pregunta por vez, barra de progreso y "Anterior". Ya no es chat |
| Círculo | Avisar a mi círculo | Lista; cada persona abre una hoja (`components/ActionSheet`) |
| Apoyo | Llamar | Tarjeta simple + botón de llamar; guías por plataforma → Biblioteca |
| Más | — | Bitácora · Biblioteca · Pedir ayuda rápido (solo Android) · Ajustes |
| Biblioteca (`app/(app)/biblioteca.tsx`) | — | Guías \| Lecturas; reemplaza `guia/index` y `aprende/index` |
| Ajustes | — | 4 grupos `Expandable`; Privacidad/Alcance/Acerca solo aquí; nueva "Cómo funciona la salida rápida" (`info/salida-rapida`) |

**Ruta visible:** `Screen` pone "Más · Bitácora", "Más · Ajustes"… según la ruta (`breadcrumbFor`).

**Asistente Vi** (`features/assistant/`):
- `engine.ts`: `reply(mensaje, historial) → Promise<BotReply>` (burbujas, acciones, sugerencias, `urgent`). Palabras clave normalizadas; **riesgo y autolesión se revisan antes que todo** (911, Pedir ayuda, Línea de la Vida 800 911 2000). Para usar una IA real: reemplazar `reply()`; la interfaz no cambia.
- `assistantStore.ts`: conversación solo en memoria; se borra al bloquear o con la salida rápida.
- `AssistantFab.tsx`: circulito abajo a la derecha en todas las pantallas de la app; sube sobre el dock o los pies con botón; se oculta en el chat, la alerta y formularios.
- `app/(app)/asistente.tsx`: chat modal, "escribiendo…", chips, botones de acción. En web, Enter envía.

**Paleta "aurora violeta" (v1.2.0):** fondo índigo `#130E24`, orquídea `#A97BEA`, orbe lila → periwinkle; acentos: Inicio lila, Orienta periwinkle, Círculo rosa, Apoyo aqua, Más durazno. Títulos en **Space Grotesk**, cuerpo en Inter. Todo en `src/theme/`.

**Segunda ronda (mismo día):** ideas tomadas (no copiadas) de la app del compañero de equipo, adaptadas al estilo propio:
- Inicio: el círculo en órbita del orbe (satélites + "+"), mensaje con nombres y 3 atajos.
- Orienta: entrada, opciones con explicación, medidor de 3 niveles (Te afecta · Es violencia digital · Puede ser delito), "Qué dice la ley" (texto general, sin números de artículo), plan marcable, guardar en Mis registros prellenado (`/bitacora/nueva?platform&type&title`), "Hablar con Vi" (`/asistente?tema=`), y `/orientacion?ruta=1.0.1.2` para abrir un recorrido hecho en el chat.
- Vi: `features/assistant/flows.ts` (conversación por pasos con estado) sobre `engine.ts` (intenciones). Riesgo siempre primero; "salir" corta el flujo.
- Mis registros (antes "Mi bitácora"): agrupado por mes, consejos de captura, formulario en 3 bloques.
- Guías: pasos numerados con palomita, sin tachado.
- Web: `features/sos/webSimulator.ts` simula lo que solo existe en Android (botones, SMS, ícono discreto, recordatorios, adjuntar capturas), con aviso "Modo simulación".
- Salida rápida: se queda la calculadora (Mario descartó otra pantalla de disfraz).

**Web/PWA:** `scripts/build-web.mjs` agrega `manifest.json`, ícono y metas de Apple para instalarla en la pantalla de inicio del iPhone. En la web del iPhone no se piden notificaciones (no hay push).
