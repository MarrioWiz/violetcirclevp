/**
 * Cerebro de Vi (asistente). HOY: respuestas programadas por palabras clave, sin red.
 *
 * Para cambiarla por una IA real, reemplaza `reply()` por una llamada a tu API que devuelva
 * el mismo `BotReply`. La interfaz (burbujas, sugerencias, botones) no cambia.
 * Regla que debe conservar cualquier versión: revisar RIESGO antes que cualquier otra cosa.
 */

export type BotAction =
  | { kind: 'route'; label: string; href: string }
  | { kind: 'call911'; label: string }
  | { kind: 'call'; label: string; phone: string };

export interface BotReply {
  /** Una o varias burbujas seguidas. */
  messages: string[];
  /** Botones que hacen algo (abrir una sección, llamar). */
  actions?: BotAction[];
  /** Preguntas sugeridas (chips) para seguir la conversación. */
  suggestions?: string[];
  /** Riesgo detectado: la interfaz lo pinta como urgente. */
  urgent?: boolean;
  /** Para pruebas y para saber qué entendió. */
  intent: string;
}

export interface ChatTurn {
  from: 'user' | 'bot';
  text: string;
}

export const BOT_NAME = 'Vi';

const LINEA_DE_LA_VIDA = '8009112000';

// ── Acciones reutilizables ────────────────────────────────────────────────

const A = {
  help: { kind: 'route', label: 'Pedir ayuda', href: '/alerta' },
  call911: { kind: 'call911', label: 'Llamar al 911' },
  circle: { kind: 'route', label: 'Mi círculo', href: '/circulo' },
  orient: { kind: 'route', label: 'Orientarme paso a paso', href: '/orientacion' },
  evidenceGuide: { kind: 'route', label: 'Cómo guardar evidencia', href: '/guia/conservar-evidencia' },
  newEntry: { kind: 'route', label: 'Guardar lo que pasó', href: '/bitacora/nueva' },
  library: { kind: 'route', label: 'Ver guías', href: '/biblioteca' },
  support: { kind: 'route', label: 'Directorio de apoyo', href: '/directorio' },
  quickExit: { kind: 'route', label: 'Ver cómo funciona', href: '/info/salida-rapida' },
  vida: { kind: 'call', label: 'Línea de la Vida (24 h)', phone: LINEA_DE_LA_VIDA },
} satisfies Record<string, BotAction>;

export const MAIN_SUGGESTIONS = [
  '¿Cómo reporto un caso?',
  'Me están acosando en redes',
  '¿Cómo uso la app?',
  'Contactos de apoyo',
  'Estoy en peligro',
];

export const WELCOME: BotReply = {
  intent: 'welcome',
  messages: [
    'Hola, soy Vi 💜 Estoy aquí para ayudarte.',
    'Puedes escribirme con tus palabras lo que está pasando, o elegir una opción. Nada de lo que escribas se guarda ni sale de tu teléfono.',
  ],
  suggestions: MAIN_SUGGESTIONS,
};

// ── Normalización ─────────────────────────────────────────────────────────

/** minúsculas, sin acentos ni signos, con espacios a los lados para buscar palabras. */
export function normalize(text: string): string {
  const s = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return ` ${s} `;
}

const has = (t: string, keys: string[]) => keys.filter((k) => t.includes(k)).length;

// ── Intenciones ───────────────────────────────────────────────────────────

interface Intent {
  id: string;
  keys: string[];
  reply: () => Omit<BotReply, 'intent'>;
}

/** Riesgo para su vida o su integridad: SIEMPRE se revisa primero. */
const SELF_HARM = [
  'suicid',
  'quitarme la vida',
  'me quiero matar',
  'quiero matarme',
  'no quiero vivir',
  'no quiero seguir viviendo',
  'hacerme dano',
  'lastimarme',
  'cortarme',
  'quiero morir',
  'me quiero morir',
];

const DANGER = [
  'me quiere matar',
  'me va a matar',
  'me van a matar',
  'matarme',
  'me esta siguiendo',
  'me estan siguiendo',
  ' me sigue ',
  'peligro',
  'auxilio',
  'socorro',
  'ayuda urgente',
  'emergencia',
  'amenaza de muerte',
  // Amenazas a su integridad (las de "publicar fotos" van a la intención 'intimate').
  'con matar',
  'con golpear',
  'con hacerme dano',
  'con lastimarme',
  'me golpea',
  'me golpeo',
  'me pega',
  'me pego',
  'secuestr',
  'violar',
  'violacion',
  'no estoy a salvo',
  'tengo miedo de que me',
  'esta afuera de mi casa',
  'sabe donde vivo',
  'sabe donde estoy',
];

const INTENTS: Intent[] = [
  {
    id: 'intimate',
    keys: ['fotos intim', 'foto intim', 'packs', ' pack ', 'nudes', 'desnud', 'sextors', 'sexting', 'video intim', 'contenido intim', 'ley olimpia'],
    reply: () => ({
      messages: [
        'Lo que estás viviendo es muy serio, y no es tu culpa. Compartir o amenazar con compartir contenido íntimo sin tu consentimiento es violencia digital y en México es delito (Ley Olimpia).',
        'Lo más importante ahora: no pagues ni mandes más contenido, no borres los mensajes y guarda capturas con fecha y usuario. Luego puedes reportarlo en la plataforma y denunciar.',
      ],
      actions: [A.evidenceGuide, A.support, A.circle],
      suggestions: ['¿Cómo reporto un caso?', '¿Cómo guardo evidencia?', 'Contactos de apoyo'],
    }),
  },
  {
    id: 'report',
    keys: ['report', 'denunci', 'bloquear', 'bloqueo', 'policia', 'fiscalia', 'ministerio', 'demanda', 'acusar', 'levantar un acta', 'caso'],
    reply: () => ({
      messages: [
        'Claro, te acompaño. Para reportar un caso hay tres caminos, y puedes usar uno o todos:',
        '1. Guarda evidencia primero (capturas con fecha, usuario y enlace).\n2. Reporta y bloquea en la plataforma (WhatsApp, Instagram, TikTok…).\n3. Si quieres una denuncia formal, la Policía Cibernética o la Fiscalía pueden orientarte.',
        'Si no estás segura de qué es lo que pasó, te ayudo a ubicarlo con unas preguntas cortas.',
      ],
      actions: [A.evidenceGuide, A.library, A.support, A.orient],
      suggestions: ['¿Cómo guardo evidencia?', 'Contactos de apoyo', '¿Esto es violencia digital?'],
    }),
  },
  {
    id: 'evidence',
    keys: ['evidencia', 'captura', 'pantallazo', 'screenshot', 'prueba', 'guardar', 'bitacora', 'registrar', 'anotar'],
    reply: () => ({
      messages: [
        'Guardar lo que pasa te da más opciones después, aunque hoy no quieras denunciar.',
        'Haz capturas donde se vea la fecha, el usuario y el mensaje; copia los enlaces y no borres las conversaciones. En "Mi bitácora" puedes guardarlo todo cifrado, solo en tu teléfono.',
      ],
      actions: [A.newEntry, A.evidenceGuide],
      suggestions: ['¿Cómo reporto un caso?', '¿Quién puede ver mis datos?'],
    }),
  },
  {
    id: 'harassment',
    keys: [
      'acos',
      'molest',
      'hostig',
      'violencia',
      'insult',
      'extors',
      'difund',
      'publicaron',
      'subieron',
      'hacke',
      'suplant',
      'cuenta falsa',
      'perfil falso',
      'stalk',
      'me vigila',
      'revisa mi celular',
      'revisa mi telefono',
      'contrasena',
      'me escribe',
      'no me deja en paz',
      'redes',
      'whatsapp',
      'instagram',
      'tiktok',
      'facebook',
      'mensajes',
    ],
    reply: () => ({
      messages: [
        'Siento mucho que estés pasando por esto. Lo que sientes es válido y no es tu culpa.',
        'Algunas cosas que ayudan desde ya: no respondas a provocaciones, guarda evidencia y bloquea o reporta la cuenta cuando ya tengas tus capturas. Si quieres, te hago unas preguntas para orientarte mejor.',
      ],
      actions: [A.orient, A.evidenceGuide, A.help],
      suggestions: ['¿Cómo reporto un caso?', '¿Cómo guardo evidencia?', 'Quiero avisar a alguien'],
    }),
  },
  {
    id: 'feelings',
    keys: ['triste', 'miedo', 'asustad', 'ansiedad', 'ansiosa', 'nerviosa', 'sola', 'culpa', 'verguenza', 'llorar', 'lloro', 'me siento mal', 'muy mal', 'estoy mal', 'no puedo mas', 'agobiad', 'estres'],
    reply: () => ({
      messages: [
        'Gracias por contarme cómo te sientes. Es completamente normal sentirse así, y no tienes que resolverlo sola.',
        'Si te sirve, respira conmigo un momento: inhala 4 segundos, sostén 4, exhala 6. Cuando estés lista, puedo ayudarte a avisar a alguien de confianza o a encontrar apoyo psicológico.',
      ],
      actions: [A.circle, A.support],
      suggestions: ['Quiero avisar a alguien', 'Contactos de apoyo', 'Estoy en peligro'],
    }),
  },
  {
    id: 'circle',
    keys: ['circulo', 'avisar', 'avisarle', 'persona de confianza', 'amiga', 'mama', 'familia', 'contacto', 'agregar'],
    reply: () => ({
      messages: [
        'Tu círculo son hasta 5 personas de confianza. Desde la pestaña Círculo puedes agregarlas y avisarles con un toque; el mensaje sale de tu teléfono y nunca se sube a un servidor.',
      ],
      actions: [A.circle],
      suggestions: ['¿Cómo pido ayuda rápido?', '¿Cómo uso la app?'],
    }),
  },
  {
    id: 'sos',
    keys: ['pedir ayuda', 'pido ayuda', 'boton', 'orbe', 'circulo morado', ' sms ', 'alerta', 'ubicacion', 'volumen', 'rapido'],
    reply: () => ({
      messages: [
        'En Inicio está el botón "Pedir ayuda": si lo tocas, ves opciones (avisar a tu círculo, llamar al 911 o guardar lo que pasa). Si lo mantienes presionado 2 segundos, se manda un mensaje con tu ubicación a tu círculo.',
        'En Android también puedes activarlo sin abrir la app, desde Más → Pedir ayuda rápido.',
      ],
      actions: [A.help],
      suggestions: ['¿Cómo agrego a mi círculo?', '¿Cómo uso la app?'],
    }),
  },
  {
    id: 'quickExit',
    keys: ['calculadora', 'salida rapida', 'esconder', 'ocultar', 'alguien viene', 'me ven', 'que no vean', 'discreto', 'discreta'],
    reply: () => ({
      messages: [
        'Si alguien se acerca, toca "Salida rápida" (arriba a la derecha): la app se esconde detrás de una calculadora que sí funciona.',
        'Para volver, escribe tu PIN en la calculadora y toca "=".',
      ],
      actions: [A.quickExit],
      suggestions: ['¿Quién puede ver mis datos?', '¿Cómo uso la app?'],
    }),
  },
  {
    id: 'resources',
    keys: ['numero', 'telefono', 'linea', 'donde acudir', 'a donde', 'psicolog', 'abogad', 'juridic', 'institucion', 'apoyo', ' uvp ', 'universidad', 'recursos', 'contactos de apoyo', 'ayuda profesional'],
    reply: () => ({
      messages: [
        'En la pestaña Apoyo están los contactos verificados por el equipo: atención a mujeres, apoyo psicológico, asesoría jurídica, Policía Cibernética y opciones dentro de la UVP.',
        'Si estás en peligro inmediato, el 911 atiende las 24 horas.',
      ],
      actions: [A.support, A.call911],
      suggestions: ['¿Cómo reporto un caso?', 'Me siento muy mal'],
    }),
  },
  {
    id: 'privacy',
    keys: ['privacidad', 'mis datos', 'quien ve', 'quien puede ver', 'se guarda', 'seguro', 'segura la app', 'rastre', 'espia'],
    reply: () => ({
      messages: [
        'Tu bitácora, tu evidencia y tu círculo se guardan cifrados solo en este teléfono, protegidos con tu PIN. No pedimos tu nombre ni usamos publicidad.',
        'Y esta conversación conmigo no se guarda: se borra al bloquear la app.',
      ],
      actions: [A.quickExit],
      suggestions: ['¿Cómo funciona la salida rápida?', '¿Cómo uso la app?'],
    }),
  },
  {
    id: 'howto',
    keys: ['como funciona', 'como uso', 'como se usa', 'que es esta app', 'para que sirve', 'que puedo hacer', 'que hace la app', 'la app', 'tutorial', 'secciones'],
    reply: () => ({
      messages: [
        'Te cuento rápido dónde está cada cosa (abajo, en la barra):',
        '• Inicio: el botón "Pedir ayuda".\n• Orienta: preguntas cortas para entender lo que pasó.\n• Círculo: tus personas de confianza.\n• Apoyo: contactos verificados.\n• Más: tu bitácora privada, guías y ajustes.',
        '¿Por dónde te gustaría empezar?',
      ],
      suggestions: ['¿Esto es violencia digital?', '¿Cómo reporto un caso?', '¿Cómo pido ayuda rápido?'],
    }),
  },
  {
    id: 'isViolence',
    keys: ['es violencia', 'esto es', 'es normal', 'no se si', 'no estoy segura', 'sera que'],
    reply: () => ({
      messages: [
        'Es muy válido tener dudas. Si algo te hace sentir incómoda, vigilada o con miedo, merece atención.',
        'En Orienta te hago unas preguntas cortas y al final te digo qué podría ser y qué puedes hacer. Nada de lo que elijas se guarda.',
      ],
      actions: [A.orient],
      suggestions: ['Me están acosando en redes', 'Contactos de apoyo'],
    }),
  },
  {
    id: 'thanks',
    keys: ['gracias', 'grax', 'te agradezco', 'muy amable'],
    reply: () => ({
      messages: ['Para eso estoy 💜 Si necesitas algo más, aquí sigo.'],
      suggestions: MAIN_SUGGESTIONS.slice(0, 3),
    }),
  },
  {
    id: 'bye',
    keys: ['adios', 'bye', 'hasta luego', 'nos vemos', 'chao', 'ya me voy'],
    reply: () => ({
      messages: ['Cuídate mucho. Recuerda que puedes volver cuando quieras; aquí voy a estar.'],
    }),
  },
  {
    id: 'whatToDo',
    keys: ['que hago', 'que hacer', 'que puedo hacer', 'no se que hacer', 'ayuda', 'ayudame', 'necesito', 'orientame', 'que hacen', 'que haces'],
    reply: () => ({
      messages: [
        'Estoy aquí para ayudarte. Vamos paso a paso, a tu ritmo.',
        '¿Qué está pasando? Puedes contármelo con tus palabras o elegir una de estas opciones.',
      ],
      suggestions: MAIN_SUGGESTIONS,
    }),
  },
  {
    id: 'greeting',
    keys: [' hola ', ' holi', ' buenas ', 'buenos dias', 'buenas tardes', 'buenas noches', ' hey ', ' que tal ', ' ola ', ' hi '],
    reply: () => ({
      messages: ['¡Hola! Estoy aquí para ayudarte 💜', '¿Qué te gustaría hacer? Puedes escribirme o elegir una opción.'],
      suggestions: MAIN_SUGGESTIONS,
    }),
  },
];

const FALLBACK: Omit<BotReply, 'intent'> = {
  messages: [
    'No estoy segura de entender, pero estoy aquí para ayudarte. ¿Quieres que te muestre estas opciones?',
  ],
  suggestions: MAIN_SUGGESTIONS,
};

/** Clasifica el mensaje. Exportada para pruebas. */
export function classify(message: string): string {
  const t = normalize(message);
  if (has(t, SELF_HARM)) return 'selfHarm';
  if (has(t, DANGER)) return 'danger';
  let best = { id: 'fallback', score: 0 };
  for (const intent of INTENTS) {
    const score = has(t, intent.keys);
    if (score > best.score) best = { id: intent.id, score };
  }
  return best.id;
}

function build(intent: string): BotReply {
  if (intent === 'selfHarm') {
    return {
      intent,
      urgent: true,
      messages: [
        'Gracias por decírmelo. Lo que sientes importa, y no estás sola.',
        'Ahora mismo puedes hablar con alguien que sabe escuchar: la Línea de la Vida atiende gratis las 24 horas. Si estás en peligro inmediato, llama al 911. También puedes avisar a alguien de tu círculo para que esté contigo.',
      ],
      actions: [A.vida, A.call911, A.help],
    };
  }
  if (intent === 'danger') {
    return {
      intent,
      urgent: true,
      messages: [
        'Tu seguridad es lo primero. Si estás en peligro ahora, llama al 911.',
        'También puedes avisar ya a tu círculo con tu ubicación desde "Pedir ayuda". Si puedes, ve a un lugar con más gente.',
      ],
      actions: [A.call911, A.help, A.circle],
    };
  }
  const found = INTENTS.find((i) => i.id === intent);
  return { intent, ...(found ? found.reply() : FALLBACK) };
}

/**
 * Responde un mensaje. Es asíncrona a propósito: así una IA real (que tarda) encaja sin
 * cambiar la interfaz. `history` no se usa todavía; una IA real lo aprovecharía.
 */
export async function reply(message: string, _history: ChatTurn[] = []): Promise<BotReply> {
  // Respuestas cortas a una pregunta del bot ("¿quieres que te muestre…?").
  const t = normalize(message);
  if (/^ (si|sip|claro|ok|va|dale|por favor|porfa) $/.test(t)) {
    return {
      intent: 'yes',
      messages: ['Va. Estas son algunas cosas en las que te puedo ayudar:'],
      suggestions: MAIN_SUGGESTIONS,
    };
  }
  if (/^ (no|nop|nel|no gracias) $/.test(t)) {
    return {
      intent: 'no',
      messages: ['Está bien. Aquí estoy por si me necesitas; puedes escribirme lo que quieras.'],
    };
  }
  return build(classify(message));
}
