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
