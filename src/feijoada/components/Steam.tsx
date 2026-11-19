import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Wisp = { x: number; y: number; period: number; offset: number; peak: number; w: number; h: number };

// Posições em coordenadas da tigela.png (saindo do caldo)
const WISPS: Wisp[] = [
  { x: 560, y: 1230, period: 110, offset: 0, peak: 0.24, w: 70, h: 260 },
  { x: 700, y: 1130, period: 96, offset: 37, peak: 0.3, w: 80, h: 300 },
  { x: 850, y: 1240, period: 120, offset: 71, peak: 0.2, w: 70, h: 250 },
  { x: 960, y: 1150, period: 104, offset: 18, peak: 0.26, w: 75, h: 280 },
  { x: 620, y: 1400, period: 130, offset: 90, peak: 0.16, w: 65, h: 240 },
];

export const Steam: React.FC = () => {
  const frame = useCurrentFrame();
  const master = interpolate(frame, [110, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (master <= 0) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id="steamBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {WISPS.map((w, i) => {
          const t = (((frame - 110 + w.offset) % w.period) + w.period) % w.period / w.period;
          const rise = t * 340;
          const sway = Math.sin(t * Math.PI * 2 + i * 1.7) * 22;
          const scale = 0.7 + t * 0.7;
          const opacity = Math.sin(Math.PI * t) ** 1.5 * w.peak * master;
          // Fio de vapor em S
          const d = `M 0 0 C ${w.w * 0.6} ${-w.h * 0.25}, ${-w.w * 0.6} ${-w.h * 0.5}, 0 ${-w.h * 0.7} S ${w.w * 0.5} ${-w.h * 0.95}, ${w.w * 0.1} ${-w.h}`;
          return (
            <g
              key={i}
              transform={`translate(${w.x + sway} ${w.y - rise}) scale(${scale})`}
              opacity={opacity}
              filter="url(#steamBlur)"
            >
              <path d={d} stroke="#FFF6EA" strokeWidth={w.w * 0.55} strokeLinecap="round" fill="none" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
