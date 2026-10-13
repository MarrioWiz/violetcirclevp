import { create } from 'zustand';

import { useSession } from '@/store/sessionStore';

import { WELCOME, reply, type BotAction, type ChatTurn } from './engine';

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
  send: (text: string) => Promise<void>;
  reset: () => void;
}

let seq = 0;
const id = () => `m${++seq}`;
/** Cambia al reiniciar: las respuestas en camino de una conversación borrada se descartan. */
let generation = 0;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** "Escribiendo…" proporcional al largo del texto, para que se sienta natural. */
export const typingDelay = (text: string) => Math.min(1800, Math.max(650, 350 + text.length * 14));

function welcome(): Pick<AssistantState, 'messages' | 'suggestions' | 'typing'> {
  return {
    messages: WELCOME.messages.map((text) => ({ id: id(), from: 'bot', text })),
    suggestions: WELCOME.suggestions ?? [],
    typing: false,
  };
}

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
    const history: ChatTurn[] = get().messages.map((m) => ({ from: m.from, text: m.text }));
    set((s) => ({ messages: [...s.messages, { id: id(), from: 'user', text }], suggestions: [], typing: true }));

    const r = await reply(text, history);
    for (let i = 0; i < r.messages.length; i++) {
      const msg = r.messages[i];
      // El riesgo no espera: la primera burbuja urgente sale casi de inmediato.
      await wait(r.urgent && i === 0 ? 400 : typingDelay(msg));
      if (gen !== generation) return;
      const last = i === r.messages.length - 1;
      set((s) => ({
        messages: [
          ...s.messages,
          { id: id(), from: 'bot', text: msg, urgent: r.urgent, actions: last ? r.actions : undefined },
        ],
        typing: !last,
      }));
    }
    if (gen === generation) set({ suggestions: r.suggestions ?? [] });
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
