import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Steam } from "./Steam";

/** Centro aproximado da tigela dentro de tigela.png (1080x1920) */
export const BOWL_CENTER = { x: 1021, y: 1320 };

export const Bowl: React.FC<{ dx: number; dy: number }> = ({ dx, dy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrada 6–30: vem da direita girando e assenta com leve overshoot
  const s = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120, mass: 1 } });
  const enterX = interpolate(s, [0, 1], [600, 0]);
  // Gira no sentido anti-horário pra borda cortada da imagem nunca aparecer no quadro
  const enterRot = interpolate(s, [0, 1], [-25, 0]);

  // Vida (120+): tigela "respirando", ±1.5° num seno lento (2 ciclos até o frame 360)
  const breatheAmt = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breathe = Math.sin(((frame - 120) / 120) * Math.PI * 2) * 1.5 * breatheAmt;

  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${BOWL_CENTER.x + dx}px ${BOWL_CENTER.y + dy}px`,
        transform: `translate(${dx + enterX}px, ${dy}px) rotate(${enterRot + breathe}deg)`,
      }}
    >
      <Img
        src={staticFile("feijoada/tigela.png")}
        style={{
          width: "100%",
          height: "100%",
          filter: "drop-shadow(-22px 30px 30px rgba(28, 8, 0, 0.55))",
        }}
      />
      <Steam />
    </AbsoluteFill>
  );
};
