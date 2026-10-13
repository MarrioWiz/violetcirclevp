/**
 * Conversación guiada de Vi: preguntas de seguimiento por pasos sobre el "cerebro" de `engine.ts`.
 *
 * `respond(mensaje, { state, circleNames })` devuelve la respuesta y el estado siguiente.
 * Todo es local y programado (sin red). Regla fija: el RIESGO se revisa antes que cualquier flujo.
 */
import triageJson from '@/assets/content/triage.json';
import { answer, getNode, isResultNode, resolveResult } from '@/features/triage/engine';
import type { TriageTree } from '@/types';

import { MAIN_SUGGESTIONS, classify, normalize, replyFor, type BotAction, type BotReply } from './engine';

const tree = triageJson as unknown as TriageTree;

type Flow = 'harass' | 'intimate' | 'evidence' | 'report' | 'offerTriage' | 'triage' | 'breathe' | 'next';

export interface ViState {
  flow?: Flow;
  step?: string;
  /** Datos que se van juntando (plataforma, paso del consejo…). */
  data?: Record<string, string>;
  /** Orienta dentro del chat. */
  node?: string;
  ctx?: Record<string, string>;
  path?: number[];
}

export interface ViInput {
  state: ViState;
  /** Nombres de su círculo, para hablarle de "Ana" y no de "tu círculo". */
  circleNames?: string[];
}

export interface ViOutput {
  reply: BotReply;
  state: ViState;
}

// ── Utilidades ────────────────────────────────────────────────────────────

const PLATFORMS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  otra: 'otra app',
};
const PLATFORM_CHIPS = ['WhatsApp', 'Instagram', 'TikTok', 'Facebook', 'Otra'];

const PLATFORM_TIPS: Record<string, string[]> = {
  whatsapp: [
    'Antes de bloquear, toma capturas o exporta el chat (⋮ → Más → Exportar chat).',
    'Después abre el chat → toca su nombre → "Reportar" y "Bloquear".',
  ],
  instagram: [
    'Toma capturas del perfil y de los mensajes con el @usuario visible.',
    'En su perfil → ⋯ → "Reportar". Si no quieres que se entere, usa "Restringir"; si no, "Bloquear".',
  ],
  tiktok: [
    'Captura el perfil, el video o los comentarios con el @usuario visible.',
    'En su perfil → flecha de compartir → "Reportar". En un comentario: mantenlo presionado → "Reportar".',
  ],
  facebook: [
    'Captura el perfil y las publicaciones o mensajes.',
    'En su perfil → ⋯ → "Buscar ayuda o reportar perfil" y luego "Bloquear".',
  ],
  otra: [
    'Captura todo con la fecha y el usuario visibles.',
    'Busca "Reportar" o "Bloquear" en el menú del perfil o del mensaje.',
  ],
};

const CAPTURE_TIPS = [
  'Que se vea el @usuario o el número completo, no solo el nombre.',
  'Que se vean la fecha y la hora.',
  'Guárdala tal cual: sin recortar ni dibujar encima.',
  'Primero guarda, después bloquea o reporta.',
];

const A = {
  support: { kind: 'route', label: 'A quién acudir', href: '/directorio' },
  notify: { kind: 'route', label: 'Avisar a mi círculo', href: '/alerta?compose=1' },
  circle: { kind: 'route', label: 'Mi círculo', href: '/circulo' },
  journal: { kind: 'route', label: 'Mis registros', href: '/bitacora' },
  orient: { kind: 'route', label: 'Abrir Orienta', href: '/orientacion' },
  call911: { kind: 'call911', label: 'Llamar al 911' },
  help: { kind: 'route', label: 'Pedir ayuda', href: '/alerta' },
  vida: { kind: 'call', label: 'Línea de la Vida (24 h)', phone: '8009112000' },
} satisfies Record<string, BotAction>;

function newRecord(platform?: string, type?: string, title = 'Lo que pasó'): BotAction {
  const q = [
    platform ? `platform=${platform}` : '',
    type ? `type=${type}` : '',
    `title=${encodeURIComponent(title)}`,
  ]
    .filter(Boolean)
    .join('&');
  return { kind: 'route', label: 'Guardar en mis registros', href: `/bitacora/nueva?${q}` };
}

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));
const isNo = (t: string) =>
  /^ (no|nop|nel|todavia no|aun no|todavia|no gracias|por ahora no|no se|no estoy segura|no lo se) /.test(t) ||
  has(t, [' todavia ', ' aun no ', ' no estoy segura ', ' no se ', ' por ahora no ']);
const isYes = (t: string) =>
  !isNo(t) &&
  (/^ (si|sip|claro|ok|okay|va|dale|ya|porfa|por favor|siguiente|listo|de acuerdo) /.test(t) ||
    has(t, [' si ', ' estoy a salvo ', ' ya las tengo ', ' ya tengo ', ' respiremos ']));

function pickPlatform(t: string): string | undefined {
  if (has(t, ['whats', 'wasa', 'wpp'])) return 'whatsapp';
  if (has(t, ['insta', ' ig '])) return 'instagram';
  if (has(t, ['tik', 'tok'])) return 'tiktok';
  if (has(t, ['face', ' fb ', 'messenger'])) return 'facebook';
  if (has(t, ['otra', 'correo', 'mail', 'twitter', 'snap', 'telegram', 'discord'])) return 'otra';
  return undefined;
}

function joinNames(list: string[]): string {
  if (list.length <= 1) return list[0] ?? '';
  return `${list.slice(0, -1).join(', ')} y ${list[list.length - 1]}`;
}

const bot = (messages: string[], extra: Omit<BotReply, 'messages' | 'intent'> = {}, intent = 'flow'): BotReply => ({
  intent,
  messages,
  ...extra,
});

/** Pregunta de cierre de casi todos los flujos: qué quiere hacer ahora. */
function nextQuestion(names: string[], lead: string[] = []): ViOutput {
  return {
    reply: bot([...lead, '¿Qué te gustaría hacer ahora?'], {
      suggestions: [
        'A quién acudir',
        names.length ? `Avisarle a ${names[0]}` : 'Avisar a alguien',
        '¿Qué tan serio es?',
        'Por ahora es todo',
      ],
    }),
    state: { flow: 'next' },
  };
}

// ── Orienta dentro del chat ───────────────────────────────────────────────

function askTriage(nodeId: string, ctx: Record<string, string>, path: number[], lead: string[] = []): ViOutput {
  const node = getNode(tree, nodeId);
  if (isResultNode(node)) return triageResult(nodeId, ctx, path);
  return {
    reply: bot([...lead, node.question], { suggestions: node.options.map((o) => o.label) }),
    state: { flow: 'triage', node: nodeId, ctx, path },
  };
}

function triageResult(nodeId: string, ctx: Record<string, string>, path: number[]): ViOutput {
  const node = getNode(tree, nodeId);
  if (!isResultNode(node)) return askTriage(nodeId, ctx, path);
  const { result, platform } = resolveResult(tree, node, ctx);
  const levels = ['Te afecta', 'Es violencia digital', 'Puede ser delito'];
  const level = result.level ?? (result.urgent ? 3 : 2);
  const actions: BotAction[] = [
    { kind: 'route', label: 'Ver mi plan completo', href: `/orientacion?ruta=${path.join('.')}` },
    newRecord(platform, result.kind === 'riesgo' ? undefined : result.kind, `Orientación: ${result.title}`.slice(0, 80)),
    A.support,
  ];
  if (result.urgent) actions.unshift(A.call911, A.help);
  return {
    reply: bot(
      [
        `Gracias por contarme. Lo que describes podría ser: ${result.title}.`,
        `Qué tan serio es: ${levels[level - 1]}. ${result.explanation}`,
        `Lo primero que puedes hacer:\n• ${result.doNow.slice(0, 2).join('\n• ')}`,
        'No es tu culpa. Si quieres, sigo aquí para lo que necesites.',
      ],
      { actions, urgent: result.urgent, suggestions: ['¿Cómo guardo evidencia?', '¿Cómo lo reporto?'] },
      'triageResult',
    ),
    state: {},
  };
}

function matchOption(t: string, labels: string[]): number {
  const n = Number(t.trim());
  if (Number.isInteger(n) && n >= 1 && n <= labels.length) return n - 1;
  const norm = labels.map(normalize);
  let i = norm.findIndex((l) => l === t);
  if (i >= 0) return i;
  i = norm.findIndex((l) => t.trim().length >= 3 && (l.includes(t.trim()) || t.includes(l.trim())));
  return i;
}

// ── Inicio de flujos ──────────────────────────────────────────────────────

function start(intent: string, names: string[]): ViOutput | null {
  switch (intent) {
    case 'harassment':
      return {
        reply: bot(
          [
            'Siento mucho que estés pasando por esto. Lo que sientes es válido y no es tu culpa.',
            'Antes de seguir: ¿estás a salvo ahora mismo?',
          ],
          { suggestions: ['Sí, estoy a salvo', 'No', 'No estoy segura'] },
          'harassment',
        ),
        state: { flow: 'harass', step: 'safe' },
      };
    case 'intimate':
      return {
        reply: bot(
          [
            'Lo que estás viviendo es muy serio, y no es tu culpa. Compartir o amenazar con compartir contenido íntimo sin tu consentimiento es violencia digital y en México es delito (Ley Olimpia).',
            '¿Te están pidiendo dinero o más fotos a cambio de no publicar algo?',
          ],
          { suggestions: ['Sí, me piden algo', 'No, ya lo publicaron', 'Solo me amenazan'] },
          'intimate',
        ),
        state: { flow: 'intimate', step: 'demand' },
      };
    case 'evidence':
      return {
        reply: bot(['Te lo explico en 4 pasos cortos.', `Paso 1 de 4: ${CAPTURE_TIPS[0]}`], {
          suggestions: ['Siguiente', 'Ya lo sé'],
        }, 'evidence'),
        state: { flow: 'evidence', data: { i: '0' } },
      };
    case 'report':
      return {
        reply: bot(['Claro, te acompaño. Primero lo primero: ¿en qué app pasó?'], { suggestions: PLATFORM_CHIPS }, 'report'),
        state: { flow: 'report', step: 'platform' },
      };
    case 'isViolence':
      return {
        reply: bot(
          [
            'Es muy válido tener dudas. Si algo te hace sentir incómoda, vigilada o con miedo, merece atención.',
            '¿Quieres que te haga unas preguntas aquí mismo? Son de 3 a 5 y nada se guarda.',
          ],
          { suggestions: ['Sí, aquí en el chat', 'Prefiero la pantalla Orienta'] },
          'isViolence',
        ),
        state: { flow: 'offerTriage' },
      };
    case 'feelings':
      return {
        reply: bot(
          [
            'Gracias por contarme cómo te sientes. Es normal sentirse así, y no tienes que resolverlo sola.',
            '¿Quieres que respiremos juntas un minuto?',
          ],
          { suggestions: ['Sí, respiremos', 'No, gracias'] },
          'feelings',
        ),
        state: { flow: 'breathe', step: 'offer' },
      };
    case 'circle':
      if (!names.length) return null;
      return {
        reply: bot([`Tienes a ${joinNames(names)} en tu círculo.`, '¿Quieres avisarles ahora? Se prepara el mensaje y tú decides cuándo enviarlo.'], {
          actions: [A.notify, A.circle],
        }, 'circle'),
        state: {},
      };
    default:
      return null;
  }
}

// ── Pasos de cada flujo ───────────────────────────────────────────────────

function step(state: ViState, t: string, names: string[]): ViOutput | null {
  const d = state.data ?? {};
  switch (state.flow) {
    case 'harass': {
      if (state.step === 'safe') {
        if (isNo(t)) return { reply: replyFor('danger'), state: {} };
        if (isYes(t))
          return {
            reply: bot(['Me alegra. Vamos paso a paso.', '¿En qué app está pasando?'], { suggestions: PLATFORM_CHIPS }),
            state: { flow: 'harass', step: 'platform' },
          };
        return {
          reply: bot(['Solo para estar segura: ¿estás a salvo ahora mismo?'], {
            suggestions: ['Sí, estoy a salvo', 'No', 'No estoy segura'],
          }),
          state,
        };
      }
      if (state.step === 'platform') {
        const p = pickPlatform(t);
        if (!p) return { reply: bot(['¿En cuál de estas apps?'], { suggestions: PLATFORM_CHIPS }), state };
        return {
          reply: bot(
            [`En ${PLATFORMS[p]} te recomiendo:\n• ${PLATFORM_TIPS[p].join('\n• ')}`, '¿Ya guardaste capturas de lo que pasó?'],
            {
              suggestions: ['Sí, ya las tengo', 'Todavía no'],
              actions: [{ kind: 'route', label: `Guía de ${PLATFORMS[p]}`, href: `/guia/plataforma-${p}` }],
            },
          ),
          state: { flow: 'harass', step: 'captures', data: { platform: p } },
        };
      }
      if (state.step === 'captures') {
        const p = d.platform;
        if (isYes(t)) return nextQuestion(names, ['¡Muy bien! Eso es lo que más te protege después.']);
        const out = nextQuestion(names, [
          `Hagámoslo ahora, es lo que más te protege:\n• ${CAPTURE_TIPS.join('\n• ')}`,
          'Puedes guardar todo en "Mis registros", cifrado y solo en tu teléfono.',
        ]);
        out.reply.actions = [newRecord(p, 'ciberacoso', 'Mensajes que no quiero')];
        return out;
      }
      return null;
    }

    case 'intimate': {
      const asking = isYes(t) || has(t, [' piden ', ' dinero ', ' mas fotos ', ' a cambio ']);
      const kind = asking ? 'sextorsion' : 'difusion';
      const advice = asking
        ? [
            'No pagues ni mandes nada más: casi nunca se detiene y suele empeorar.',
            'Deja de responder sin borrar nada. Captura el perfil y lo que te piden, y repórtalo en la app.',
            'Esto puede ser extorsión y violación a la intimidad sexual: puedes denunciarlo.',
          ]
        : [
            'No reenvíes el contenido, ni para pedir ayuda: comparte solo enlaces o capturas con lo indispensable.',
            'Guarda dónde se publicó (enlace, usuario, fecha) y repórtalo como contenido íntimo sin consentimiento.',
            'Puedes denunciar: la Fiscalía puede pedir que se retire y dictar medidas de protección.',
          ];
      const out = nextQuestion(names, [`Esto es lo más importante ahora:\n• ${advice.join('\n• ')}`]);
      out.reply.actions = [newRecord(undefined, kind, 'Contenido íntimo'), { kind: 'route', label: 'Cómo guardar evidencia', href: '/guia/conservar-evidencia' }];
      return out;
    }

    case 'evidence': {
      const i = Number(d.i ?? '0');
      if (has(t, [' ya lo se ', ' ya se '])) {
        return {
          reply: bot(['Perfecto. ¿Quieres crear tu registro ahora?'], {
            actions: [newRecord()],
            suggestions: ['¿Cómo lo reporto?', 'Por ahora es todo'],
          }),
          state: {},
        };
      }
      const next = i + 1;
      if (next < CAPTURE_TIPS.length)
        return {
          reply: bot([`Paso ${next + 1} de 4: ${CAPTURE_TIPS[next]}`], { suggestions: ['Siguiente', 'Ya lo sé'] }),
          state: { flow: 'evidence', data: { i: String(next) } },
        };
      return {
        reply: bot(['¡Listo! Con eso tus capturas sirven mucho más.', '¿Quieres crear tu registro ahora? Ahí puedes adjuntarlas.'], {
          actions: [newRecord()],
          suggestions: ['¿Cómo lo reporto?', 'Por ahora es todo'],
        }),
        state: {},
      };
    }

    case 'report': {
      if (state.step === 'platform') {
        const p = pickPlatform(t);
        if (!p) return { reply: bot(['¿En cuál de estas apps?'], { suggestions: PLATFORM_CHIPS }), state };
        return {
          reply: bot(
            [`Para reportar en ${PLATFORMS[p]}:\n• ${PLATFORM_TIPS[p].join('\n• ')}`, '¿Quieres además hacer una denuncia formal?'],
            {
              suggestions: ['Sí, quiero denunciar', 'Por ahora no'],
              actions: [{ kind: 'route', label: `Guía de ${PLATFORMS[p]}`, href: `/guia/plataforma-${p}` }],
            },
          ),
          state: { flow: 'report', step: 'formal', data: { platform: p } },
        };
      }
      if (state.step === 'formal') {
        if (isYes(t) || has(t, [' denunciar '])) {
          return {
            reply: bot(
              [
                'Puedes acudir a la Fiscalía o a la Policía Cibernética. No necesitas abogada para empezar.',
                'Lleva tus capturas, los enlaces o @usuarios y, si puedes, el PDF de "Mis registros".',
                'Si quieres, primero llama para que te orienten: llamar no te obliga a denunciar.',
              ],
              { actions: [A.support, A.journal], suggestions: ['Me siento muy mal', 'Por ahora es todo'] },
            ),
            state: {},
          };
        }
        return {
          reply: bot(
            ['Está bien, tú decides el ritmo. Guardar tus capturas te deja la puerta abierta por si cambias de opinión.'],
            { actions: [newRecord(d.platform)], suggestions: MAIN_SUGGESTIONS.slice(0, 3) },
          ),
          state: {},
        };
      }
      return null;
    }

    case 'offerTriage': {
      if (has(t, [' orienta ', ' pantalla '])) {
        return { reply: bot(['Te llevo a Orienta. Ahí verás también tu plan completo.'], { actions: [A.orient] }), state: {} };
      }
      if (isYes(t) || has(t, [' aqui ', ' chat ']))
        return askTriage(tree.start, {}, [], ['Va. Contesta con un toque o escríbeme. Puedes escribir "salir" cuando quieras.']);
      return null;
    }

    case 'triage': {
      const node = getNode(tree, state.node ?? tree.start);
      if (isResultNode(node)) return triageResult(node.id, state.ctx ?? {}, state.path ?? []);
      const idx = matchOption(t, node.options.map((o) => o.label));
      if (idx < 0) {
        return {
          reply: bot(['Para seguir, elige una de las opciones. Si prefieres hablar de otra cosa, escribe "salir".'], {
            suggestions: node.options.map((o) => o.label),
          }),
          state,
        };
      }
      const nextStep = answer({ nodeId: node.id, context: state.ctx ?? {} }, node.options[idx]);
      const path = [...(state.path ?? []), idx];
      return askTriage(nextStep.nodeId, nextStep.context, path);
    }

    case 'breathe': {
      if (state.step === 'offer') {
        if (isYes(t))
          return {
            reply: bot(
              [
                'Ponte cómoda. Vamos juntas:',
                'Inhala por la nariz… 1, 2, 3, 4',
                'Sostén el aire… 1, 2, 3, 4',
                'Exhala lento por la boca… 1, 2, 3, 4, 5, 6',
                'Repítelo dos veces más, a tu ritmo. Cuando termines, cuéntame: ¿cómo te sientes ahora?',
              ],
              { suggestions: ['Un poco mejor', 'Igual', 'Peor'] },
            ),
            state: { flow: 'breathe', step: 'after' },
          };
        return {
          reply: bot(['Está bien. Aquí sigo; puedes contarme lo que quieras o elegir una opción.'], {
            suggestions: MAIN_SUGGESTIONS,
          }),
          state: {},
        };
      }
      if (has(t, [' mejor ']))
        return {
          reply: bot(['Me alegra 💜 Puedes volver a respirar así cuando lo necesites.', '¿Quieres que veamos algo más?'], {
            suggestions: MAIN_SUGGESTIONS.slice(0, 3),
          }),
          state: {},
        };
      return {
        reply: bot(
          [
            'Gracias por decírmelo. A veces ayuda hablar con alguien.',
            names.length
              ? `¿Quieres avisarle a ${joinNames(names)}? También hay apoyo psicológico gratuito.`
              : 'Puedes avisar a alguien de confianza o buscar apoyo psicológico gratuito.',
          ],
          { actions: [A.notify, A.support, A.vida] },
        ),
        state: {},
      };
    }

    case 'next': {
      if (has(t, [' acudir ', ' a quien ', ' donde '])) return { reply: replyFor('resources'), state: {} };
      if (has(t, [' avisar', ' avisarle '])) {
        return {
          reply: bot(
            [names.length ? `Te preparo el mensaje para ${joinNames(names)}; tú decides cuándo enviarlo.` : 'Primero agrega a alguien de confianza a tu círculo; después podrás avisarle con un toque.'],
            { actions: names.length ? [A.notify] : [A.circle] },
          ),
          state: {},
        };
      }
      if (has(t, [' serio ', ' preguntas ']))
        return askTriage(tree.start, {}, [], ['Te hago unas preguntas cortas para saber qué tan serio es.']);
      if (has(t, [' todo ', ' gracias ', ' nada ']))
        return {
          reply: bot(['Está bien. Cuídate mucho 💜 Aquí voy a estar si me necesitas.']),
          state: {},
        };
      return null;
    }
    default:
      return null;
  }
}

// ── API ───────────────────────────────────────────────────────────────────

const EXIT = [' salir ', ' menu ', ' cancelar ', ' otra cosa ', ' empezar de nuevo '];

/**
 * Responde un mensaje dentro de la conversación. Es asíncrona a propósito: así una IA real
 * (que tarda) encaja sin cambiar la interfaz.
 */
export async function respond(message: string, input: ViInput): Promise<ViOutput> {
  const t = normalize(message);
  const names = input.circleNames ?? [];
  const intent = classify(message);

  // 1. Riesgo: siempre primero, aunque esté en medio de un flujo.
  if (intent === 'danger' || intent === 'selfHarm') return { reply: replyFor(intent), state: {} };

  // 2. Salir de un flujo.
  if (has(t, EXIT)) {
    return {
      reply: bot(['Claro. ¿De qué te gustaría hablar?'], { suggestions: MAIN_SUGGESTIONS }, 'menu'),
      state: {},
    };
  }

  // 3. Siguiente paso del flujo en curso.
  if (input.state.flow) {
    const out = step(input.state, t, names);
    if (out) return out;
  }

  // 4. Mensaje nuevo: empieza un flujo o responde en una vuelta.
  const started = start(intent, names);
  if (started) return started;
  return { reply: replyFor(intent), state: {} };
}

/** Saludo cuando se llega desde un resultado de Orienta ("Hablar con Vi sobre esto"). */
export function topicIntro(kind: string): ViOutput {
  const result = tree.results[kind as keyof typeof tree.results];
  if (!result) return { reply: replyFor('greeting'), state: {} };
  return {
    reply: bot(
      [
        `Vi que lo que te pasa podría ser: ${result.title}. Estoy aquí contigo y no es tu culpa.`,
        '¿Por dónde quieres empezar?',
      ],
      {
        urgent: result.urgent,
        actions: result.urgent ? [A.call911, A.help] : undefined,
        suggestions: ['¿Cómo guardo evidencia?', '¿Cómo lo reporto?', 'A quién acudir', 'Me siento muy mal'],
      },
      'topic',
    ),
    state: {},
  };
}
