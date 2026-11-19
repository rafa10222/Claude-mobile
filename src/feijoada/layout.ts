import { Easing } from "remotion";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 360; // 12s

export type Variant = "stories" | "reels";

/** Margens seguras (px) */
export const SAFE = {
  top: 270, // 14%
  side: 65, // 6%
  bottom: { stories: 384, reels: 672 } as Record<Variant, number>, // 20% / 35%
};

/**
 * Layout por versão. As posições do bloco de texto estão em coordenadas da arte
 * original escalada pra 1080x1920; o bloco inteiro é deslocado/escalado pra caber
 * na área segura de cada versão, mantendo a hierarquia.
 */
export type Layout = {
  logo: { top: number; size: number };
  /** Bloco "Toda sexta-feira" + FEIJOADA + fita */
  block: { dx: number; dy: number; scale: number };
  tag: { left: number; top: number; scale: number };
  bowl: { dx: number; dy: number };
};

export const LAYOUTS: Record<Variant, Layout> = {
  stories: {
    logo: { top: 284, size: 168 },
    block: { dx: 10, dy: 214, scale: 1 },
    tag: { left: 84, top: 1258, scale: 1 },
    bowl: { dx: 40, dy: 200 },
  },
  reels: {
    logo: { top: 280, size: 148 },
    block: { dx: 4, dy: 190, scale: 0.88 },
    tag: { left: 82, top: 1004, scale: 0.86 },
    bowl: { dx: 40, dy: 150 },
  },
};

/** Origem do escalonamento do bloco (canto sup. esq. do "Toda sexta-feira" na original) */
export const BLOCK_ORIGIN = { x: 70, y: 246 };

export const COLORS = {
  feijoada: "#FCA001",
  feijoadaDeep: "#F08A00",
  script: "#F1D2A1",
  tape: "#EDB04C",
  tapeLight: "#F6CB72",
  tapeText: "#2D1201",
};

// Curvas com cara de motion design
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // expo-out
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_SOFT = Easing.bezier(0.33, 1, 0.68, 1); // cubic-out
