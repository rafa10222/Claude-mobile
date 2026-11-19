import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE_IN_OUT } from "../layout";

/** Vazamento de luz quente na abertura (atravessa o quadro saindo do preto). */
export const LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 50) return null;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const t = interpolate(frame, [0, 48], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const o = interpolate(frame, [0, 10, 26, 48], [0, 0.85, 0.55, 0], clamp);
  const cx = interpolate(t, [0, 1], [-200, 1250]);
  const cy = interpolate(t, [0, 1], [260, 900]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o }}>
      <div
        style={{
          position: "absolute",
          left: cx - 700,
          top: cy - 900,
          width: 1400,
          height: 1800,
          borderRadius: "50%",
          transform: "rotate(-30deg)",
          background:
            "radial-gradient(ellipse, rgba(255,190,90,0.95) 0%, rgba(255,120,30,0.55) 35%, rgba(200,60,0,0) 70%)",
        }}
      />
    </AbsoluteFill>
  );
};
