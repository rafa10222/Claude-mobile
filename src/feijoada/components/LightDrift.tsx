import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DURATION } from "../layout";

/** Luz de janela (faixas diagonais) derivando bem devagar por cima da cena. */
export const LightDrift: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, DURATION], [-70, 70]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden", mixBlendMode: "soft-light", opacity: 0.55 }}>
      <div
        style={{
          position: "absolute",
          left: -800,
          top: -800,
          width: 2700,
          height: 3500,
          transform: `rotate(-38deg) translateX(${drift}px)`,
          background:
            "repeating-linear-gradient(90deg, rgba(255,236,200,0) 0px, rgba(255,236,200,0.55) 120px, rgba(255,236,200,0) 240px, rgba(20,6,0,0.35) 330px, rgba(20,6,0,0) 420px)",
          filter: "blur(28px)",
        }}
      />
    </AbsoluteFill>
  );
};
