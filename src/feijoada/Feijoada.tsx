import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { Bowl } from "./components/Bowl";
import { Headline } from "./components/Headline";
import { IfoodTag } from "./components/IfoodTag";
import { LightDrift } from "./components/LightDrift";
import { Logo } from "./components/Logo";
import { SafeZoneOverlay } from "./components/SafeZoneOverlay";
import { Tape } from "./components/Tape";
import { BLOCK_ORIGIN, DURATION, EASE_IN_OUT, LAYOUTS, Variant } from "./layout";
import "./fonts";

export type FeijoadaProps = { showSafeZone: boolean };

/** Frame em que a última letra de FEIJOADA assenta (dispara o shake). */
export const LAST_LETTER_LAND = 79;

const cameraShake = (frame: number) => {
  // 4 frames de tremida, 2–3px, amortecendo
  const seq: [number, number][] = [
    [3, -2],
    [-2, 3],
    [2, -1],
    [-1, 1],
  ];
  const i = frame - LAST_LETTER_LAND;
  return i >= 0 && i < seq.length ? seq[i] : [0, 0];
};

export const Feijoada: React.FC<FeijoadaProps & { variant: Variant }> = ({
  showSafeZone,
  variant,
}) => {
  const frame = useCurrentFrame();
  const L = LAYOUTS[variant];

  // Push-in lento da cena (fundo + tigela): 1.08 → 1.0 nos 12s
  const pushIn = interpolate(frame, [0, DURATION], [1.08, 1], {
    easing: EASE_IN_OUT,
    extrapolateRight: "clamp",
  });
  const [sx, sy] = cameraShake(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {/* Cena: recebe o push-in */}
        <AbsoluteFill style={{ transform: `scale(${pushIn})` }}>
          <Background />
          <Bowl dx={L.bowl.dx} dy={L.bowl.dy} />
          <LightDrift />
        </AbsoluteFill>

        {/* Informação: fora do push-in pra nunca sair da área segura */}
        <Logo top={L.logo.top} size={L.logo.size} />
        <AbsoluteFill
          style={{
            transformOrigin: `${BLOCK_ORIGIN.x}px ${BLOCK_ORIGIN.y}px`,
            transform: `translate(${L.block.dx}px, ${L.block.dy}px) scale(${L.block.scale})`,
          }}
        >
          <Headline />
          <Tape />
        </AbsoluteFill>
        <IfoodTag left={L.tag.left} top={L.tag.top} scale={L.tag.scale} />
      </AbsoluteFill>

      {/* Fade de entrada do preto */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 15], [1, 0], {
            easing: EASE_IN_OUT,
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
      {showSafeZone ? <SafeZoneOverlay variant={variant} /> : null}
    </AbsoluteFill>
  );
};

export const FeijoadaStories: React.FC<FeijoadaProps> = (p) => (
  <Feijoada {...p} variant="stories" />
);
export const FeijoadaReels: React.FC<FeijoadaProps> = (p) => <Feijoada {...p} variant="reels" />;
