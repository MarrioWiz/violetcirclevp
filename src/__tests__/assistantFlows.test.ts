import { respond, topicIntro, type ViState } from '@/features/assistant/flows';

/** Simula una conversación: cada mensaje usa el estado que dejó el anterior. */
async function chat(messages: string[], circleNames: string[] = []) {
  let state: ViState = {};
  const replies = [];
  for (const m of messages) {
    const out = await respond(m, { state, circleNames });
    state = out.state;
    replies.push(out.reply);
  }
  return { replies, state };
}

describe('Vi: conversaciones guiadas', () => {
  it('acoso: a salvo → app → capturas → qué hacer, con consejos de la plataforma', async () => {
    const { replies, state } = await chat(
      ['me están acosando en instagram', 'Sí, estoy a salvo', 'Instagram', 'Todavía no'],
      ['Ana'],
    );
    expect(replies[0].messages.join(' ')).toMatch(/estás a salvo/);
    expect(replies[1].suggestions).toContain('WhatsApp');
    expect(replies[2].messages[0]).toMatch(/En Instagram/);
    expect(replies[3].actions?.[0]).toMatchObject({ kind: 'route', href: expect.stringContaining('/bitacora/nueva') });
    expect(replies[3].suggestions).toContain('Avisarle a Ana');
    expect(state.flow).toBe('next');
  });

  it('acoso: si no está a salvo, ofrece 911 de inmediato', async () => {
    const { replies } = await chat(['me molestan por whatsapp', 'No']);
    expect(replies[1].urgent).toBe(true);
    expect(replies[1].actions?.some((a) => a.kind === 'call911')).toBe(true);
  });

  it('el riesgo interrumpe cualquier flujo', async () => {
    const { replies, state } = await chat(['¿cómo lo reporto?', 'me quiere matar']);
    expect(replies[1].intent).toBe('danger');
    expect(state).toEqual({});
  });

  it('Orienta dentro del chat llega a un resultado con plan y ruta para abrirlo completo', async () => {
    const { replies } = await chat([
      '¿esto es violencia digital?',
      'Sí, aquí en el chat',
      'No en este momento',
      'WhatsApp',
      'Compartieron fotos o videos íntimos míos sin mi permiso',
      'No, solo lo compartieron',
    ]);
    const last = replies[replies.length - 1];
    expect(last.intent).toBe('triageResult');
    expect(last.messages[0]).toMatch(/Difusión de contenido íntimo/);
    expect(last.messages[1]).toMatch(/Puede ser delito/);
    expect(last.actions?.[0]).toMatchObject({ href: '/orientacion?ruta=1.0.1.2' });
  });

  it('en Orienta del chat también acepta el número de la opción', async () => {
    const { replies } = await chat(['¿esto es violencia digital?', 'si', '2', '1']);
    expect(replies[3].messages[0]).toMatch(/Qué es lo que más se parece/);
  });

  it('evidencia: 4 pasos con "Siguiente" y al final ofrece crear el registro', async () => {
    const { replies } = await chat(['¿cómo guardo evidencia?', 'Siguiente', 'Siguiente', 'Siguiente', 'Siguiente']);
    expect(replies[0].messages[1]).toMatch(/Paso 1 de 4/);
    expect(replies[3].messages[0]).toMatch(/Paso 4 de 4/);
    expect(replies[4].actions?.[0].label).toBe('Guardar en mis registros');
  });

  it('respiración guiada y seguimiento', async () => {
    const { replies } = await chat(['me siento muy mal', 'Sí, respiremos', 'Peor'], ['Luz']);
    expect(replies[1].messages.join(' ')).toMatch(/Inhala/);
    expect(replies[2].messages.join(' ')).toMatch(/Luz/);
  });

  it('"salir" corta el flujo y vuelve al menú', async () => {
    const { replies, state } = await chat(['¿cómo lo reporto?', 'salir']);
    expect(replies[1].intent).toBe('menu');
    expect(state).toEqual({});
  });

  it('desde un resultado de Orienta, Vi abre con el tema', () => {
    const out = topicIntro('sextorsion');
    expect(out.reply.messages[0]).toMatch(/Sextorsión/);
  });
});

describe('Vi: acoso en persona', () => {
  it('pregunta si está a salvo, dónde pasa y da consejos del lugar', async () => {
    const { replies, state } = await chat(
      ['un maestro me acosa en clase', 'Sí, estoy a salvo', 'En la universidad', 'Sí'],
      ['Ana'],
    );
    expect(replies[0].intent).toBe('inPerson');
    expect(replies[1].suggestions).toContain('En la universidad');
    expect(replies[2].messages[0]).toMatch(/protocolo/);
    expect(replies[2].actions?.[0]).toMatchObject({ href: expect.stringContaining('platform=presencial') });
    expect(replies[3].messages.join(' ')).toMatch(/delito/);
    expect(state.flow).toBe('next');
  });

  it('en casa ofrece llamar a Telmujer', async () => {
    const { replies } = await chat(['mi pareja me agarra fuerte', 'si', 'En casa o con mi pareja']);
    expect(replies[2].actions?.some((a) => a.kind === 'call' && a.phone === '2222323738')).toBe(true);
  });
});

describe('Vi: cambia a "en persona" si no es en una app', () => {
  it('acoso → a salvo → "en persona" pregunta dónde pasa (no vuelve a pedir la app)', async () => {
    const { replies, state } = await chat(['me están acosando', 'estoy a salvo', 'en persona']);
    expect(replies[1].suggestions).toContain('En persona');
    expect(replies[2].messages.join(' ')).toMatch(/Dónde está pasando/);
    expect(replies[2].suggestions).toContain('En la universidad');
    expect(state).toMatchObject({ flow: 'inPerson', step: 'place' });
  });

  it('también desde "¿cómo lo reporto?"', async () => {
    const { replies } = await chat(['¿cómo lo reporto?', 'fue en la calle']);
    expect(replies[1].messages.join(' ')).toMatch(/pasa en persona/);
  });
});
