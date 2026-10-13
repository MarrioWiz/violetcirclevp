import { create } from 'zustand';

import { useCircle } from '@/store/circleStore';
import { useSession } from '@/store/sessionStore';

import { WELCOME, type BotAction, type BotReply } from './engine';
import { respond, topicIntro, type ViState } from './flows';

export interface ChatMessage {
  id: string;
  from: 'user' | 'bot';
  text: string;
  urgent?: boolean;
  /** Botones bajo la burbuja (solo en la última burbuja de cada respuesta). */
  actions?: BotAction[];
}

interface AssistantState {
  messages: ChatMessage[];
  suggestions: string[];
  typing: boolean;
  /** Paso de la conversación guiada en curso. */
  flow: ViState;
  send: (text: string) => Promise<void>;
  /** Llega desde un resultado de Orienta: Vi abre con ese tema. */
  startTopic: (kind: string) => Promise<void>;
  reset: () => void;
}

let seq = 0;
const id = () => `m${++seq}`;
/** Cambia al reiniciar: las respuestas en camino de una conversación borrada se descartan. */
let generation = 0;

/** Muestra las burbujas de una respuesta una por una, con "escribiendo…" entre ellas. */
async function play(r: BotReply, gen: number): Promise<void> {
  for (let i = 0; i < r.messages.length; i++) {
    const msg = r.messages[i];
    // El riesgo no espera: la primera burbuja urgente sale casi de inmediato.
    await wait(r.urgent && i === 0 ? 400 : typingDelay(msg));
    if (gen !== generation) return;
    const last = i === r.messages.length - 1;
    useAssistant.setState((s) => ({
      messages: [
        ...s.messages,
        { id: id(), from: 'bot', text: msg, urgent: r.urgent, actions: last ? r.actions : undefined },
      ],
      typing: !last,
    }));
  }
  if (gen === generation) useAssistant.setState({ suggestions: r.suggestions ?? [], typing: false });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** "Escribiendo…" proporcional al largo del texto, para que se sienta natural. */
export const typingDelay = (text: string) => Math.min(1800, Math.max(650, 350 + text.length * 14));

function welcome(): Pick<AssistantState, 'messages' | 'suggestions' | 'typing' | 'flow'> {
  return {
    messages: WELCOME.messages.map((text) => ({ id: id(), from: 'bot', text })),
    suggestions: WELCOME.suggestions ?? [],
    typing: false,
    flow: {},
  };
}

const circleNames = () => useCircle.getState().contacts.map((c) => c.name.split(' ')[0]);

/**
 * Conversación con Vi. SOLO en memoria: no se guarda en el teléfono ni sale a ningún servidor,
 * y se borra al bloquear la app o usar la salida rápida.
 */
export const useAssistant = create<AssistantState>((set, get) => ({
  ...welcome(),
  send: async (raw) => {
    const text = raw.trim();
    if (!text || get().typing) return;
    const gen = generation;
    set((s) => ({ messages: [...s.messages, { id: id(), from: 'user', text }], suggestions: [], typing: true }));
    const out = await respond(text, { state: get().flow, circleNames: circleNames() });
    if (gen !== generation) return;
    set({ flow: out.state });
    await play(out.reply, gen);
  },
  startTopic: async (kind) => {
    if (get().typing) return;
    const gen = generation;
    const out = topicIntro(kind);
    set({ suggestions: [], typing: true, flow: out.state });
    await play(out.reply, gen);
  },
  reset: () => {
    generation++;
    set(welcome());
  },
}));

// Privacidad: al bloquear o disfrazar la app, la conversación desaparece.
useSession.subscribe((s, prev) => {
  if ((s.locked && !prev.locked) || (s.disguised && !prev.disguised)) useAssistant.getState().reset();
});
