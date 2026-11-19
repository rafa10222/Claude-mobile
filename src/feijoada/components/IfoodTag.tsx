import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_IN_OUT } from "../layout";

/** Tamanho do PNG recortado (já em escala 1080) e inclinação que ele já tem na arte */
const TAG_W = 529;
const TAG_H = 239;
const INHERENT_ROT = -4.5;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const IfoodTag: React.FC<{ left: number; top: number; scale: number }> = ({ left, top, scale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 95–120: entra por baixo/esquerda com spring + motion blur
  const s = spring({ frame: frame - 95, fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const sPrev = spring({ frame: frame - 96, fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const x = interpolate(s, [0, 1], [-320, 0]);
  const y = interpolate(s, [0, 1], [380, 0]);
  const rotVisual = interpolate(s, [0, 1], [-6, -2]);
  const opacity = interpolate(frame, [95, 101], [0, 1], clamp);
  const blur = Math.min(8, Math.abs(s - sPrev) * 500 * 0.06);

  // 120+: pulso 1 → 1.05 a cada 45 frames
  const amt = interpolate(frame, [118, 126], [0, 1], clamp);
  const ph = ((((frame - 120) % 45) + 45) % 45) / 45;
  const pulse = 1 + 0.05 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2)) * amt;

  // Chamada de atenção: "wiggle" a cada 90 frames (150, 240, 330)
  const wt = frame >= 150 ? (frame - 150) % 90 : -1;
  const wiggle = wt >= 0 && wt < 14 ? Math.sin((wt / 14) * Math.PI * 4) * 3.2 * (1 - wt / 14) : 0;

  // Brilho atravessando a etiqueta (máscara em gradiente sobre cópia clareada do PNG)
  const st = frame >= 165 ? (frame - 165) % 90 : -1;
  const shineX = st >= 0 && st < 24 ? interpolate(st, [0, 24], [-25, 125], { easing: EASE_IN_OUT }) : null;
  const shineMask = shineX === null ? "" : `linear-gradient(110deg, transparent ${shineX - 12}%, #000 ${shineX}%, transparent ${shineX + 12}%)`;

  const w = TAG_W * scale;
  const h = TAG_H * scale;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        opacity,
        transform: `translate(${x}px, ${y}px) rotate(${rotVisual - INHERENT_ROT + wiggle}deg) scale(${pulse})`,
        filter: `drop-shadow(0 ${12 + (pulse - 1) * 200}px ${14 + (pulse - 1) * 160}px rgba(25,8,0,0.5))${blur > 0.2 ? ` blur(${blur}px)` : ""}`,
      }}
    >
      <Img src={staticFile("feijoada/ifood-tag.png")} style={{ position: "absolute", inset: 0, width: w, height: h }} />
      {shineX !== null ? (
        <Img
          src={staticFile("feijoada/ifood-tag.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: w,
            height: h,
            filter: "brightness(1.35)",
            WebkitMaskImage: shineMask,
            maskImage: shineMask,
          }}
        />
      ) : null}
    </div>
  );
};
