import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { GoldDust } from "./components/GoldDust";
import { LightLeak } from "./components/LightLeak";
import { Vignette } from "./components/Vignette";
import { Bowl } from "./components/Bowl";
import { Headline, TITLE_LAND } from "./components/Headline";
import { IfoodTag } from "./components/IfoodTag";
import { LightDrift } from "./components/LightDrift";
import { Logo } from "./components/Logo";
import { SafeZoneOverlay } from "./components/SafeZoneOverlay";
import { Tape } from "./components/Tape";
import { BLOCK_ORIGIN, DURATION, EASE_IN_OUT, LAYOUTS, Variant } from "./layout";
import "./fonts";

export type FeijoadaProps = { showSafeZone: boolean };

/** Impactos de câmera: queda da última letra do FEIJOADA e a fita colando */
const IMPACTS: { at: number; amp: number }[] = [
  { at: TITLE_LAND, amp: 1 },
  { at: 87, amp: 0.7 },
];
const SHAKE: [number, number][] = [
  [3, -2],
  [-2.5, 3],
  [2, -1.5],
  [-1, 1],
];

const cameraShake = (frame: number): [number, number] => {
  for (const { at, amp } of IMPACTS) {
    const i = frame - at;
    if (i >= 0 && i < SHAKE.length) return [SHAKE[i][0] * amp, SHAKE[i][1] * amp];
  }
  return [0, 0];
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
        <Vignette />
        <GoldDust />

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
      {/* Light leak por cima do preto: a luz "acende" a cena */}
      <LightLeak />
      {showSafeZone ? <SafeZoneOverlay variant={variant} /> : null}
    </AbsoluteFill>
  );
};

export const FeijoadaStories: React.FC<FeijoadaProps> = (p) => (
  <Feijoada {...p} variant="stories" />
);
export const FeijoadaReels: React.FC<FeijoadaProps> = (p) => <Feijoada {...p} variant="reels" />;
