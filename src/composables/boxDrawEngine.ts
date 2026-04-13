export type Bbox = [number, number, number, number];

export interface BoxDrawEngine {
  start(onEnd: (bbox: Bbox) => void): void;
  cleanUp(): void;
}

export function toBbox(a: [number, number], b: [number, number]): Bbox {
  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[0], b[0]),
    Math.max(a[1], b[1]),
  ];
}
