import { MAIN_SUGGESTIONS, WELCOME, classify, reply } from '@/features/assistant/engine';

describe('asistente Vi (respuestas programadas)', () => {
  it('saluda con sugerencias', async () => {
    const r = await reply('Hola');
    expect(r.intent).toBe('greeting');
    expect(r.messages[0]).toMatch(/aquí para ayudarte/);
    expect(r.suggestions).toEqual(MAIN_SUGGESTIONS);
  });

  it('"qué hago" vuelve a ofrecer ayuda y opciones', async () => {
    const r = await reply('y ahora que hago??');
    expect(r.intent).toBe('whatToDo');
    expect(r.messages.join(' ')).toMatch(/Estoy aquí para ayudarte/);
  });

  it.each([
    ['¿Cómo reporto un caso?', 'report'],
    ['Me están acosando en redes', 'harassment'],
    ['¿Cómo uso la app?', 'howto'],
    ['Contactos de apoyo', 'resources'],
    ['¿Cómo guardo evidencia?', 'evidence'],
    ['¿Esto es violencia digital?', 'isViolence'],
    ['¿Cómo funciona la salida rápida?', 'quickExit'],
    ['Me siento muy mal', 'feelings'],
    ['me amenazan con publicar mis fotos íntimas', 'intimate'],
    ['¿Quién puede ver mis datos?', 'privacy'],
    ['gracias', 'thanks'],
  ])('"%s" → %s', (msg, intent) => {
    expect(classify(msg)).toBe(intent);
  });

  it('el riesgo gana a cualquier otra intención y ofrece 911 y Pedir ayuda', async () => {
    const r = await reply('hola, mi ex me está siguiendo y sabe donde vivo');
    expect(r.intent).toBe('danger');
    expect(r.urgent).toBe(true);
    const kinds = r.actions?.map((a) => a.kind);
    expect(kinds).toContain('call911');
    expect(r.actions?.some((a) => a.kind === 'route' && a.href === '/alerta')).toBe(true);
  });

  it('detecta riesgo de autolesión y ofrece la Línea de la Vida', async () => {
    const r = await reply('ya no quiero vivir');
    expect(r.intent).toBe('selfHarm');
    expect(r.urgent).toBe(true);
    expect(r.actions?.some((a) => a.kind === 'call')).toBe(true);
  });

  it('respuesta por defecto cuando no entiende', async () => {
    const r = await reply('xyzzy qwerty');
    expect(r.intent).toBe('fallback');
    expect(r.messages[0]).toMatch(/No estoy segura de entender/);
    expect(r.suggestions?.length).toBeGreaterThan(0);
  });

  it('"sí" tras la pregunta muestra las opciones', async () => {
    expect((await reply('Sí')).intent).toBe('yes');
  });

  it('la bienvenida no está vacía', () => {
    expect(WELCOME.messages.length).toBeGreaterThan(0);
  });
});
