import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { baloo2 } from "../fonts";
import { COLORS } from "../layout";

/* Coordenadas da arte original (1080x1920) */
export const TAPE = { left: 66, top: 712, width: 506, height: 116, fontSize: 72 };

// Bordas rasgadas determinísticas (sem random por frame)
const torn = (() => {
  const pts: string[] = [];
  const jag = (i: number, a: number) => (Math.sin(i * 12.9898) * 43758.5453) % 1;
  const n = 14;
  // topo (quase reto)
  pts.push("1.2% 2%");
  for (let i = 1; i < 10; i++) pts.push(`${(i * 10).toFixed(1)}% ${(1 + Math.abs(jag(i, 0)) * 2.5).toFixed(2)}%`);
  pts.push("98.8% 1.5%");
  // direita rasgada
  for (let i = 1; i < n; i++) pts.push(`${(99.6 - Math.abs(jag(i + 20, 0)) * 1.6 - (i % 2) * 0.7).toFixed(2)}% ${((i / n) * 100).toFixed(1)}%`);
  pts.push("99% 98%");
  // base
  for (let i = 9; i > 0; i--) pts.push(`${(i * 10).toFixed(1)}% ${(99 - Math.abs(jag(i + 40, 0)) * 2.5).toFixed(2)}%`);
  pts.push("0.8% 98.5%");
  // esquerda rasgada
  for (let i = n - 1; i > 0; i--) pts.push(`${(0.4 + Math.abs(jag(i + 60, 0)) * 1.6 + (i % 2) * 0.7).toFixed(2)}% ${((i / n) * 100).toFixed(1)}%`);
  return `polygon(${pts.join(", ")})`;
})();

export const Tape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 80–100: bate na tela tipo fita colada
  const s = spring({ frame: frame - 80, fps, config: { damping: 13, stiffness: 230, mass: 0.8 } });
  const scale = interpolate(s, [0, 1], [1.6, 1]);
  const rot = interpolate(s, [0, 1], [-8, -3]);
  const opacity = interpolate(frame, [80, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: TAPE.left,
        top: TAPE.top,
        width: TAPE.width,
        height: TAPE.height,
        opacity,
        transform: `rotate(${rot}deg) scale(${scale})`,
        filter: "drop-shadow(0 10px 12px rgba(30,10,0,0.45))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: torn,
          background: `linear-gradient(180deg, ${COLORS.tapeLight} 0%, ${COLORS.tape} 55%, #E2A03E 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* textura sutil de papel/fita */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 3px, rgba(0,0,0,0.03) 3px 7px), linear-gradient(90deg, rgba(0,0,0,0.08), rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.06))",
          }}
        />
        <span
          style={{
            position: "relative",
            fontFamily: baloo2,
            fontWeight: 800,
            fontSize: TAPE.fontSize,
            lineHeight: 1,
            color: COLORS.tapeText,
            letterSpacing: -1,
            whiteSpace: "nowrap",
            transform: "translateY(-1px)",
          }}
        >
          A partir das 11h
        </span>
      </div>
    </div>
  );
};
