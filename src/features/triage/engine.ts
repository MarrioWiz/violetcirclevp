import type { TriageNode, TriageOption, TriageQuestionNode, TriageResult, TriageResultNode, TriageTree } from '@/types';

export type TriageContext = Record<string, string>;

export function isResultNode(node: TriageNode): node is TriageResultNode {
  return 'result' in node;
}

export function getNode(tree: TriageTree, id: string): TriageNode {
  const node = tree.nodes.find((n) => n.id === id);
  if (!node) throw new Error(`Nodo de orientación no encontrado: ${id}`);
  return node;
}

export function getQuestion(tree: TriageTree, id: string): TriageQuestionNode {
  const node = getNode(tree, id);
  if (isResultNode(node)) throw new Error(`El nodo ${id} es un resultado, no una pregunta`);
  return node;
}

export interface TriageStep {
  nodeId: string;
  context: TriageContext;
}

/** Aplica una respuesta: devuelve el siguiente nodo y el contexto acumulado. */
export function answer(step: TriageStep, option: TriageOption): TriageStep {
  return { nodeId: option.next, context: { ...step.context, ...(option.set ?? {}) } };
}

/**
 * Repite un recorrido a partir de los índices de opción elegidos ("1.0.5").
 * Sirve para abrir Orienta con las respuestas que ya se dieron en el chat de Vi.
 */
export function replayPath(tree: TriageTree, path: number[]): TriageStep[] {
  const steps: TriageStep[] = [{ nodeId: tree.start, context: {} }];
  for (const idx of path) {
    const node = getNode(tree, steps[steps.length - 1].nodeId);
    if (isResultNode(node)) break;
    const opt = node.options[idx];
    if (!opt) break;
    steps.push(answer(steps[steps.length - 1], opt));
  }
  return steps;
}

/** Máximo de preguntas que aún pueden faltar desde un nodo (para la barra de progreso). */
export function remainingQuestions(tree: TriageTree, id: string, seen: Set<string> = new Set()): number {
  const node = getNode(tree, id);
  if (isResultNode(node) || seen.has(id)) return 0;
  const next = new Set(seen).add(id);
  return 1 + Math.max(0, ...node.options.map((o) => remainingQuestions(tree, o.next, next)));
}

export interface ResolvedResult {
  result: TriageResult;
  extras: string[];
  platform: string | undefined;
}

/** Arma el resultado final con los consejos extra que apliquen según el contexto. */
export function resolveResult(tree: TriageTree, node: TriageResultNode, context: TriageContext): ResolvedResult {
  const result = tree.results[node.result];
  if (!result) throw new Error(`Resultado no definido: ${node.result}`);
  const extras = tree.extras
    .filter((e) => Object.entries(e.when).every(([k, v]) => context[k] === v))
    .map((e) => e.text);
  return { result, extras, platform: context.platform };
}

/**
 * Verifica que el árbol esté bien formado: todos los "next" existen, todos los
 * resultados están definidos y todos los nodos son alcanzables desde el inicio.
 */
export function validateTree(tree: TriageTree): string[] {
  const errors: string[] = [];
  const ids = new Set(tree.nodes.map((n) => n.id));
  if (!ids.has(tree.start)) errors.push(`start inexistente: ${tree.start}`);
  if (ids.size !== tree.nodes.length) errors.push('Hay ids de nodo duplicados');

  for (const node of tree.nodes) {
    if (isResultNode(node)) {
      if (!tree.results[node.result]) errors.push(`Resultado sin definir: ${node.result}`);
      continue;
    }
    if (node.options.length === 0) errors.push(`Pregunta sin opciones: ${node.id}`);
    for (const opt of node.options) {
      if (!ids.has(opt.next)) errors.push(`${node.id} → destino inexistente: ${opt.next}`);
    }
  }

  // Alcanzabilidad y ausencia de ciclos (DFS).
  const visited = new Set<string>();
  const stack = new Set<string>();
  const visit = (id: string) => {
    if (stack.has(id)) {
      errors.push(`Ciclo detectado en ${id}`);
      return;
    }
    if (visited.has(id) || !ids.has(id)) return;
    visited.add(id);
    stack.add(id);
    const node = getNode(tree, id);
    if (!isResultNode(node)) node.options.forEach((o) => visit(o.next));
    stack.delete(id);
  };
  visit(tree.start);
  for (const id of ids) if (!visited.has(id)) errors.push(`Nodo inalcanzable: ${id}`);

  return errors;
}
