import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Pseudo-aleatório determinístico (mesmo resultado em todo frame/render)
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type P = { x: number; y: number; r: number; speed: number; sway: number; phase: number; peak: number; bokeh: boolean };

// Poeira dourada flutuando nos fachos de luz da janela (mais concentrada no alto/esquerda)
const PARTICLES: P[] = Array.from({ length: 54 }, (_, i) => {
  const bokeh = i % 7 === 0;
  return {
    x: rand(i) * 1080 * (0.55 + rand(i + 50) * 0.5),
    y: rand(i + 100) * 1920,
    r: bokeh ? 16 + rand(i + 200) * 20 : 3 + rand(i + 200) * 6,
    speed: 0.35 + rand(i + 300) * 0.9,
    sway: 10 + rand(i + 400) * 26,
    phase: rand(i + 500) * Math.PI * 2,
    peak: bokeh ? 0.28 : 0.6 + rand(i + 600) * 0.4,
    bokeh,
  };
});

export const GoldDust: React.FC = () => {
  const frame = useCurrentFrame();
  const master = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (master <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {PARTICLES.map((p, i) => {
        const y = ((p.y - frame * p.speed) % 1920 + 1920) % 1920;
        const x = p.x + Math.sin(frame / 40 + p.phase) * p.sway;
        const twinkle = 0.55 + 0.45 * Math.sin(frame / (9 + (i % 5) * 3) + p.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - p.r,
              top: y - p.r,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              background: p.bokeh
                ? "radial-gradient(circle, rgba(255,214,140,0.9) 0%, rgba(255,190,100,0.35) 45%, rgba(255,180,80,0) 70%)"
                : "radial-gradient(circle, rgba(255,240,200,1) 0%, rgba(255,200,110,0.7) 35%, rgba(255,180,80,0) 70%)",
              opacity: p.peak * twinkle * master,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
