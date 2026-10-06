import triageJson from '@/assets/content/triage.json';
import {
  answer,
  getQuestion,
  isResultNode,
  getNode,
  resolveResult,
  validateTree,
  type TriageStep,
} from '@/features/triage/engine';
import type { TriageTree } from '@/types';

const tree = triageJson as unknown as TriageTree;

/** Recorre el árbol eligiendo opciones por su texto. */
function walk(labels: string[]) {
  let step: TriageStep = { nodeId: tree.start, context: {} };
  for (const label of labels) {
    const q = getQuestion(tree, step.nodeId);
    const opt = q.options.find((o) => o.label.startsWith(label));
    if (!opt) throw new Error(`Opción no encontrada: ${label} en ${q.id}`);
    step = answer(step, opt);
  }
  const node = getNode(tree, step.nodeId);
  if (!isResultNode(node)) throw new Error(`No terminó en resultado: ${step.nodeId}`);
  return resolveResult(tree, node, step.context);
}

describe('árbol "¿Esto es violencia digital?"', () => {
  it('está bien formado: destinos existen, sin ciclos ni nodos inalcanzables', () => {
    expect(validateTree(tree)).toEqual([]);
  });

  it('cada resultado tiene qué hacer y qué no hacer', () => {
    for (const r of Object.values(tree.results)) {
      expect(r.doNow.length).toBeGreaterThanOrEqual(2);
      expect(r.dontDo.length).toBeGreaterThanOrEqual(1);
      expect(r.explanation.length).toBeGreaterThan(20);
    }
  });

  it('peligro inmediato lleva directo a resultado urgente', () => {
    const r = walk(['Sí, siento']);
    expect(r.result.kind).toBe('riesgo');
    expect(r.result.urgent).toBe(true);
  });

  it('sextorsión con pago agrega el mensaje de no culpa y guarda la plataforma', () => {
    const r = walk(['No en este momento', 'Instagram', 'Me piden dinero', 'Sí']);
    expect(r.result.kind).toBe('sextorsion');
    expect(r.platform).toBe('instagram');
    expect(r.extras.some((e) => e.includes('Haber pagado'))).toBe(true);
    expect(r.result.dontDo.some((d) => d.includes('No pagues'))).toBe(true);
  });

  it('amenaza creíble se trata como riesgo', () => {
    expect(walk(['No en este momento', 'WhatsApp', 'Me amenazan', 'Sí']).result.kind).toBe('riesgo');
    expect(walk(['No en este momento', 'WhatsApp', 'Me amenazan', 'No']).result.kind).toBe('amenazas');
  });

  it('acoso por alguien de la universidad sugiere la instancia UVP', () => {
    const r = walk(['No en este momento', 'TikTok', 'Recibo mensajes', 'Sí, es de la universidad']);
    expect(r.result.kind).toBe('ciberacoso');
    expect(r.extras.join(' ')).toContain('UVP');
  });

  it('"no estoy segura" agrega recordatorio del 911', () => {
    const r = walk(['No estoy segura', 'Facebook', 'Alguien se hace pasar']);
    expect(r.result.kind).toBe('suplantacion');
    expect(r.extras.join(' ')).toContain('911');
  });

  it('detecta árboles mal formados', () => {
    const broken: TriageTree = {
      ...tree,
      nodes: [
        { id: 'a', question: '¿?', options: [{ label: 'x', next: 'nope' }] },
        { id: 'orphan', result: 'otro' },
      ],
      start: 'a',
    };
    const errors = validateTree(broken);
    expect(errors.some((e) => e.includes('destino inexistente'))).toBe(true);
    expect(errors.some((e) => e.includes('inalcanzable'))).toBe(true);
  });
});
