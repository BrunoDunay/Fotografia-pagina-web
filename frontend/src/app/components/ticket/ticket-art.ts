/**
 * Dibujo vectorial generado por código para los diseños del ticket (hojas de palmera, rosas,
 * papel rasgado, perlas…). Todo es determinista: la misma semilla produce siempre el mismo dibujo.
 */

/** Generador pseudoaleatorio con semilla. */
export function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Punto sobre una curva cuadrática de Bézier. */
function quad(t: number, p0: [number, number], p1: [number, number], p2: [number, number]): [number, number] {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}

/**
 * Hoja de palmera: un raquis curvo con folíolos finos a ambos lados.
 * Devuelve el trazo del raquis y un único path con todos los folíolos.
 */
export function palmFrond(
  from: [number, number],
  control: [number, number],
  to: [number, number],
  options: { leaflets?: number; length?: number; droop?: number } = {},
): { rachis: string; leaflets: string } {
  const { leaflets = 26, length = 15, droop = 0.35 } = options;
  let d = '';
  for (let i = 1; i <= leaflets; i++) {
    const t = i / (leaflets + 1);
    const [x, y] = quad(t, from, control, to);
    const [x2, y2] = quad(Math.min(t + 0.02, 1), from, control, to);
    const angle = Math.atan2(y2 - y, x2 - x);
    // Folíolos más largos al centro de la hoja, cortos en la base y la punta.
    const len = length * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.15)));
    for (const side of [-1, 1]) {
      const a = angle + side * (Math.PI / 2 - 0.55) + droop * 0.4;
      const tipX = x + Math.cos(a) * len;
      const tipY = y + Math.sin(a) * len + droop * len * 0.45;
      const midX = x + Math.cos(a) * len * 0.5 + Math.cos(angle) * 0.9;
      const midY = y + Math.sin(a) * len * 0.5 + Math.sin(angle) * 0.9;
      const backX = x + Math.cos(a) * len * 0.5 - Math.cos(angle) * 0.5;
      const backY = y + Math.sin(a) * len * 0.5 - Math.sin(angle) * 0.5;
      d += `M${r2(x)} ${r2(y)}Q${r2(midX)} ${r2(midY)} ${r2(tipX)} ${r2(tipY)}Q${r2(backX)} ${r2(backY)} ${r2(x)} ${r2(y)}z`;
    }
  }
  return { rachis: `M${from[0]} ${from[1]}Q${control[0]} ${control[1]} ${to[0]} ${to[1]}`, leaflets: d };
}

/** Hoja lanceolada (olivo/eucalipto) entre dos puntos. */
export function lanceLeaf(x: number, y: number, angleDeg: number, length: number, width: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const tx = x + Math.cos(a) * length;
  const ty = y + Math.sin(a) * length;
  const nx = Math.cos(a + Math.PI / 2) * width;
  const ny = Math.sin(a + Math.PI / 2) * width;
  const mx = x + Math.cos(a) * length * 0.45;
  const my = y + Math.sin(a) * length * 0.45;
  return `M${r2(x)} ${r2(y)}Q${r2(mx + nx)} ${r2(my + ny)} ${r2(tx)} ${r2(ty)}Q${r2(mx - nx)} ${r2(my - ny)} ${r2(x)} ${r2(y)}z`;
}

export interface RosePetal {
  d: string;
  /** 0 = exterior (claro) … 1 = centro (oscuro). */
  depth: number;
}

/** Rosa vista desde arriba: capas de pétalos que se van cerrando hacia el centro. */
export function rose(cx: number, cy: number, radius: number, seed = 7): RosePetal[] {
  const random = seeded(seed);
  const petals: RosePetal[] = [];
  const layers = 5;
  for (let layer = 0; layer < layers; layer++) {
    const depth = layer / (layers - 1);
    const r = radius * (1 - depth * 0.78);
    const count = Math.max(3, 6 - layer);
    const offset = random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const a = offset + (i / count) * Math.PI * 2;
      const spread = (Math.PI / count) * 1.25;
      const a1 = a - spread;
      const a2 = a + spread;
      const inner = r * 0.28;
      const bulge = r * (1.02 + random() * 0.12);
      const p1 = [cx + Math.cos(a1) * inner, cy + Math.sin(a1) * inner];
      const p2 = [cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner];
      const c1 = [cx + Math.cos(a1 + 0.1) * bulge * 1.15, cy + Math.sin(a1 + 0.1) * bulge * 1.15];
      const c2 = [cx + Math.cos(a2 - 0.1) * bulge * 1.15, cy + Math.sin(a2 - 0.1) * bulge * 1.15];
      petals.push({ d: `M${r2(p1[0])} ${r2(p1[1])}C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}z`, depth });
    }
  }
  return petals;
}

/** Borde de papel rasgado: polígono dentado de ancho 100 y alto `height`. */
export function tornEdge(height: number, seed = 11): string {
  const random = seeded(seed);
  let top = 'M0 ' + r2(height * 0.5);
  for (let x = 0; x <= 100; x += 1.6) top += `L${r2(x)} ${r2(height * (0.12 + random() * 0.4))}`;
  let bottom = '';
  for (let x = 100; x >= 0; x -= 1.4) bottom += `L${r2(x)} ${r2(height * (0.55 + random() * 0.42))}`;
  return `${top}${bottom}z`;
}

/** Puntos repartidos sobre una curva cuadrática (hilo de perlas, guirnaldas…). */
export function alongCurve(from: [number, number], control: [number, number], to: [number, number], count: number): [number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const [x, y] = quad(i / (count - 1), from, control, to);
    return [r2(x), r2(y)] as [number, number];
  });
}
