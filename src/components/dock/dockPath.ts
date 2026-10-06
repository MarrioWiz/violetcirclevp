/**
 * Geometría del dock "líquido": barra redondeada con una muesca circular (radio rr) centrada
 * en cx sobre el borde superior, y dos hombros (filetes fL/fR) tangentes a la línea superior
 * y externamente tangentes a la muesca. Funciones worklet (se ejecutan en el hilo de UI).
 */

/** Distancia horizontal del centro de la perla al inicio del hombro. */
export function reach(rr: number, f: number): number {
  'worklet';
  return Math.sqrt((rr + f) ** 2 - f ** 2);
}

export function dockPath(W: number, H: number, R: number, cx: number, rr: number, fL: number, fR: number): string {
  'worklet';
  const dxL = Math.sqrt((rr + fL) ** 2 - fL ** 2);
  const dxR = Math.sqrt((rr + fR) ** 2 - fR ** 2);
  const kL = rr / (rr + fL);
  const kR = rr / (rr + fR);
  // Puntos de tangencia de cada hombro con la muesca.
  const pLx = cx - dxL * kL;
  const pLy = fL * kL;
  const pRx = cx + dxR * kR;
  const pRy = fR * kR;
  return [
    `M ${R} 0`,
    `H ${cx - dxL}`,
    `A ${fL} ${fL} 0 0 1 ${pLx} ${pLy}`, // hombro izquierdo (convexo)
    `A ${rr} ${rr} 0 0 0 ${pRx} ${pRy}`, // muesca (cóncava)
    `A ${fR} ${fR} 0 0 1 ${cx + dxR} 0`, // hombro derecho (convexo)
    `H ${W - R}`,
    `A ${R} ${R} 0 0 1 ${W} ${R}`,
    `V ${H - R}`,
    `A ${R} ${R} 0 0 1 ${W - R} ${H}`,
    `H ${R}`,
    `A ${R} ${R} 0 0 1 0 ${H - R}`,
    `V ${R}`,
    `A ${R} ${R} 0 0 1 ${R} 0`,
    'Z',
  ].join(' ');
}

/** Centros uniformes de N pestañas, sin que la perla de los extremos choque con la esquina. */
export function tabCenters(W: number, R: number, rr: number, f: number, n: number): number[] {
  const cxMin = R + reach(rr, f) + 2;
  const cxMax = W - cxMin;
  if (n === 1) return [W / 2];
  return Array.from({ length: n }, (_, i) => cxMin + ((cxMax - cxMin) * i) / (n - 1));
}
