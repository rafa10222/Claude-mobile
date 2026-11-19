import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { anton, caveatBrush } from "../fonts";
import { COLORS, EASE_IN_OUT, EASE_OUT, EASE_SOFT } from "../layout";

/* Posições em coordenadas da arte original (1080x1920); o pai desloca/escala o bloco. */
export const SCRIPT = { left: 76, top: 252, fontSize: 133, rotate: -3, skew: -6 };
// Pincelada: fina à esquerda, engrossando até a ponta direita (3 traços sobrepostos)
export const UNDERLINE = {
  d: "M 338 432 C 450 412, 560 397, 650 394 S 790 396, 815 401",
  layers: [
    { from: 0, width: 4.5 },
    { from: 0.35, width: 8 },
    { from: 0.7, width: 12 },
  ],
};
export const TITLE = { left: 49, top: 419, fontSize: 322, letterSpacing: -6, scaleX: 0.78 };
/** Centro visual do FEIJOADA (coordenadas da original) */
const TITLE_CENTER = { x: 467, y: 576 };

const WORD = "FEIJOADA";
export const TITLE_START = 50;
export const TITLE_STAGGER = 3;
/** Frame em que a última letra assenta (shake + explosão de brilho) */
export const TITLE_LAND = TITLE_START + (WORD.length - 1) * TITLE_STAGGER + 8; // 79

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ScriptLine: React.FC = () => {
  const frame = useCurrentFrame();
  // 30–55: revelado da esquerda pra direita com borda macia (efeito pincel escrevendo)
  const p = interpolate(frame, [30, 55], [-10, 112], { ...clamp, easing: EASE_IN_OUT });
  // leve subida + foco enquanto escreve
  const y = interpolate(frame, [30, 58], [14, 0], { ...clamp, easing: EASE_OUT });
  // 45–65: sublinhado desenhado
  const u = interpolate(frame, [45, 65], [1, 0], { ...clamp, easing: EASE_SOFT });
  const mask = `linear-gradient(90deg, #000 ${p - 9}%, transparent ${p}%)`;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: SCRIPT.left,
          top: SCRIPT.top,
          fontFamily: caveatBrush,
          fontSize: SCRIPT.fontSize,
          lineHeight: 1.2,
          color: COLORS.script,
          whiteSpace: "nowrap",
          transform: `translateY(${y}px) rotate(${SCRIPT.rotate}deg) skewX(${SCRIPT.skew}deg)`,
          transformOrigin: "left center",
          WebkitMaskImage: mask,
          maskImage: mask,
          textShadow: "0 4px 10px rgba(40,12,0,0.35)",
          padding: "0 30px 0 10px",
          marginLeft: -10,
        }}
      >
        Toda sexta-feira
      </div>
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          filter: "drop-shadow(0 3px 5px rgba(40,12,0,0.35))",
        }}
      >
        {UNDERLINE.layers.map((l, i) => {
          const drawn = 1 - u; // 0 → 1
          const local = Math.min(1, Math.max(0, (drawn - l.from) / (1 - l.from)));
          const len = 1 - l.from;
          return (
            <path
              key={i}
              d={UNDERLINE.d}
              pathLength={1}
              strokeDasharray={`${len * local} 2`}
              strokeDashoffset={-l.from}
              stroke={COLORS.script}
              strokeWidth={l.width}
              strokeLinecap="round"
              fill="none"
              opacity={local > 0 ? 1 : 0}
            />
          );
        })}
      </svg>
    </>
  );
};

const titleText: React.CSSProperties = {
  position: "absolute",
  left: TITLE.left,
  top: TITLE.top,
  fontFamily: anton,
  fontSize: TITLE.fontSize,
  lineHeight: 1,
  letterSpacing: TITLE.letterSpacing,
  whiteSpace: "nowrap",
  fontKerning: "none",
  transform: `scaleX(${TITLE.scaleX})`,
  transformOrigin: "left top",
};

/** Explosão de luz quente atrás do FEIJOADA quando a última letra cai + brilho residual */
const TitleGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - TITLE_LAND;
  const burstO = interpolate(t, [-2, 1, 24], [0, 1, 0], { ...clamp, easing: EASE_OUT });
  const burstS = interpolate(t, [-2, 22], [0.45, 1.6], { ...clamp, easing: EASE_OUT });
  const restO = interpolate(t, [6, 30], [0, 0.32], clamp) * (1 + Math.sin((frame / 60) * Math.PI * 2) * 0.25);
  const glow = (o: number, s: number, w: number, h: number, hot = false) => (
    <div
      style={{
        position: "absolute",
        left: TITLE_CENTER.x - w / 2,
        top: TITLE_CENTER.y - h / 2,
        width: w,
        height: h,
        borderRadius: "50%",
        background: hot
          ? "radial-gradient(ellipse, rgba(255,248,215,1) 0%, rgba(255,215,120,0.9) 22%, rgba(255,150,30,0.5) 45%, rgba(255,120,0,0) 70%)"
          : "radial-gradient(ellipse, rgba(255,205,110,0.95) 0%, rgba(255,150,40,0.5) 40%, rgba(255,120,0,0) 70%)",
        opacity: o,
        transform: `scale(${s})`,
        mixBlendMode: "screen",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {glow(restO, 1, 1150, 520)}
      {glow(burstO, burstS, 1050, 470, true)}
    </AbsoluteFill>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Brilho diagonal a cada 90 frames a partir do 120
  const local = frame - 120;
  const shineT = local >= 0 ? (local % 90) / 30 : -1; // varre em 30 frames, descansa 60
  const shineX =
    shineT >= 0 && shineT <= 1 ? interpolate(shineT, [0, 1], [-40, 140], { easing: EASE_IN_OUT }) : null;

  return (
    <>
      <div
        style={{
          ...titleText,
          color: COLORS.feijoada,
          textShadow: "0 8px 18px rgba(50,15,0,0.45), 0 2px 0 rgba(120,50,0,0.35)",
        }}
      >
        {WORD.split("").map((ch, i) => {
          const start = TITLE_START + i * TITLE_STAGGER;
          const s = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 190, mass: 0.7 } });
          const o = interpolate(frame - start, [0, 4], [0, 1], clamp);
          const y = interpolate(s, [0, 1], [120, 0]);
          const sc = interpolate(s, [0, 1], [1.4, 1]);
          // cada letra chega levemente torta e "endireita" — alterna o lado
          const rot = interpolate(s, [0, 1], [i % 2 === 0 ? -9 : 7, 0]);
          // motion blur fake enquanto a letra está em movimento
          const blur = interpolate(frame - start, [0, 6], [7, 0], clamp);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: o,
                transform: `translateY(${y}px) scale(${sc}) rotate(${rot}deg)`,
                transformOrigin: "50% 80%",
                filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      {shineX !== null ? (
        <div
          style={{
            ...titleText,
            color: "transparent",
            backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${shineX - 14}%, rgba(255,250,225,0.9) ${shineX}%, rgba(255,255,255,0) ${shineX + 14}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            mixBlendMode: "screen",
          }}
        >
          {WORD}
        </div>
      ) : null}
    </>
  );
};

export const Headline: React.FC = () => (
  <>
    <TitleGlow />
    <ScriptLine />
    <Title />
  </>
);
