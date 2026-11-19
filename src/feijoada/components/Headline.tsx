import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { anton, caveatBrush } from "../fonts";
import { COLORS, EASE_IN_OUT, EASE_SOFT } from "../layout";

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

const WORD = "FEIJOADA";
export const TITLE_START = 50;
export const TITLE_STAGGER = 3;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ScriptLine: React.FC = () => {
  const frame = useCurrentFrame();
  // 30–55: revelado da esquerda pra direita (efeito escrita)
  const p = interpolate(frame, [30, 55], [0, 100], { ...clamp, easing: EASE_IN_OUT });
  // 45–65: sublinhado desenhado
  const u = interpolate(frame, [45, 65], [1, 0], { ...clamp, easing: EASE_SOFT });
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
          transform: `rotate(${SCRIPT.rotate}deg) skewX(${SCRIPT.skew}deg)`,
          transformOrigin: "left center",
          clipPath: `inset(-20% ${100 - p}% -20% -5%)`,
          textShadow: "0 4px 10px rgba(40,12,0,0.35)",
          paddingRight: 20,
        }}
      >
        Toda sexta-feira
      </div>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "drop-shadow(0 3px 5px rgba(40,12,0,0.35))" }}
      >
        {UNDERLINE.layers.map((l, i) => {
          // progresso global (1 → 0) mapeado pro trecho [from, 1] de cada camada
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

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Brilho diagonal a cada 90 frames a partir do 120
  const local = frame - 120;
  const shineT = local >= 0 ? (local % 90) / 30 : -1; // varre em 30 frames, descansa 60
  const shineX = shineT >= 0 && shineT <= 1 ? interpolate(shineT, [0, 1], [-40, 140], { easing: EASE_IN_OUT }) : -100;

  return (
    <>
      <div style={{ ...titleText, color: COLORS.feijoada, textShadow: "0 8px 18px rgba(50,15,0,0.45), 0 2px 0 rgba(120,50,0,0.35)" }}>
        {WORD.split("").map((ch, i) => {
          const start = TITLE_START + i * TITLE_STAGGER;
          const s = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 190, mass: 0.7 } });
          const o = interpolate(frame - start, [0, 4], [0, 1], clamp);
          const y = interpolate(s, [0, 1], [120, 0]);
          const sc = interpolate(s, [0, 1], [1.4, 1]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: o,
                transform: `translateY(${y}px) scale(${sc})`,
                transformOrigin: "50% 80%",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      {shineX > -100 ? (
        <div
          style={{
            ...titleText,
            color: "transparent",
            backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${shineX - 14}%, rgba(255,250,225,0.85) ${shineX}%, rgba(255,255,255,0) ${shineX + 14}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            mixBlendMode: "screen",
          }}
        >
          {WORD.split("").map((ch, i) => (
            <span key={i} style={{ display: "inline" }}>
              {ch}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
};

export const Headline: React.FC = () => (
  <>
    <ScriptLine />
    <Title />
  </>
);
