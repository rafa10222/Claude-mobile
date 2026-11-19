import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/** Tamanho do PNG recortado (já em escala 1080) e inclinação que ele já tem na arte */
const TAG_W = 529;
const TAG_H = 239;
const INHERENT_ROT = -4.5;

export const IfoodTag: React.FC<{ left: number; top: number; scale: number }> = ({ left, top, scale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 95–120: entra por baixo/esquerda com spring
  const s = spring({ frame: frame - 95, fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const x = interpolate(s, [0, 1], [-320, 0]);
  const y = interpolate(s, [0, 1], [380, 0]);
  const rotVisual = interpolate(s, [0, 1], [-6, -2]);
  const opacity = interpolate(frame, [95, 101], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 120+: pulso 1 → 1.05 a cada 45 frames
  const amt = interpolate(frame, [118, 126], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ph = ((frame - 120) % 45 + 45) % 45 / 45;
  const pulse = 1 + 0.05 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2)) * amt;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: TAG_W * scale,
        height: TAG_H * scale,
        opacity,
        transform: `translate(${x}px, ${y}px) rotate(${rotVisual - INHERENT_ROT}deg) scale(${pulse})`,
        filter: "drop-shadow(0 12px 14px rgba(25,8,0,0.5))",
      }}
    >
      <Img src={staticFile("feijoada/ifood-tag.png")} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
