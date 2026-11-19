import { AbsoluteFill } from "remotion";

/** Vinheta sutil: segura o olho no centro e faz o texto saltar. */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,3,0,0.5) 100%)",
    }}
  />
);
