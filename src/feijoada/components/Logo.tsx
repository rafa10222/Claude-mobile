import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE_IN_OUT, EASE_OUT, WIDTH } from "../layout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Brilho que varre o selo: logo da entrada e depois a cada 120 frames */
const SHINES = [38, 150, 270];
const SHINE_LEN = 22;

export const Logo: React.FC<{ top: number; size: number }> = ({ top, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrada 20–40: flip 3D de moeda + escala 0.6→1 + leve descida
  const s = spring({ frame: frame - 18, fps, config: { damping: 13, stiffness: 110, mass: 0.9 } });
  const rotY = interpolate(s, [0, 1], [-110, 0]);
  const scale = interpolate(s, [0, 1], [0.6, 1]);
  const y = interpolate(frame, [18, 40], [-40, 0], { ...clamp, easing: EASE_OUT });
  const opacity = interpolate(frame, [18, 24], [0, 1], clamp);

  // Halo dourado: estoura quando o selo assenta e depois respira bem de leve
  const burst = interpolate(frame, [30, 36, 60], [0, 0.95, 0.28], { ...clamp, easing: EASE_OUT });
  const breathe = frame > 60 ? 0.28 + Math.sin(((frame - 60) / 90) * Math.PI * 2) * 0.08 : burst;
  const haloScale = interpolate(frame, [30, 60], [0.85, 1.12], { ...clamp, easing: EASE_OUT });

  // Shine diagonal (máscara em gradiente: confinada ao próprio PNG do logo)
  const active = SHINES.find((f) => frame >= f && frame < f + SHINE_LEN);
  const shineX =
    active === undefined
      ? null
      : interpolate(frame - active, [0, SHINE_LEN], [-30, 130], { easing: EASE_IN_OUT });

  const pad = size * 0.45;
  return (
    <div
      style={{
        position: "absolute",
        left: WIDTH / 2 - size / 2,
        top,
        width: size,
        height: size,
        opacity,
        transform: `translateY(${y}px) perspective(900px) rotateY(${rotY}deg) scale(${scale})`,
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -pad,
          top: -pad,
          width: size + pad * 2,
          height: size + pad * 2,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,200,95,0.85) 0%, rgba(255,170,60,0.35) 38%, rgba(255,150,40,0) 66%)",
          opacity: breathe,
          transform: `scale(${haloScale})`,
          mixBlendMode: "screen",
        }}
      />
      <Img
        src={staticFile("feijoada/logo.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: size,
          height: size,
          filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.5))",
        }}
      />
      {shineX !== null ? (
        <Img
          src={staticFile("feijoada/logo.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: size,
            height: size,
            filter: "brightness(1.9) saturate(1.15)",
            WebkitMaskImage: `linear-gradient(115deg, transparent ${shineX - 16}%, #000 ${shineX}%, transparent ${shineX + 16}%)`,
            maskImage: `linear-gradient(115deg, transparent ${shineX - 16}%, #000 ${shineX}%, transparent ${shineX + 16}%)`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
    </div>
  );
};
