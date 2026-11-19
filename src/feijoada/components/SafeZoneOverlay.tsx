import { AbsoluteFill } from "remotion";
import { HEIGHT, SAFE, Variant, WIDTH } from "../layout";

export const SafeZoneOverlay: React.FC<{ variant: Variant }> = ({ variant }) => {
  const b = SAFE.bottom[variant];
  const shade = "rgba(255, 0, 60, 0.28)";
  const label: React.CSSProperties = {
    position: "absolute",
    color: "#fff",
    font: "700 26px/1 monospace",
    textShadow: "0 1px 3px #000",
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: SAFE.top, background: shade }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: WIDTH, height: b, background: shade }} />
      <div style={{ position: "absolute", left: 0, top: SAFE.top, width: SAFE.side, height: HEIGHT - SAFE.top - b, background: shade }} />
      <div style={{ position: "absolute", right: 0, top: SAFE.top, width: SAFE.side, height: HEIGHT - SAFE.top - b, background: shade }} />
      <div
        style={{
          position: "absolute",
          left: SAFE.side,
          top: SAFE.top,
          width: WIDTH - SAFE.side * 2,
          height: HEIGHT - SAFE.top - b,
          border: "3px dashed #00FF88",
          boxSizing: "border-box",
        }}
      />
      <div style={{ ...label, left: 20, top: 20 }}>
        {variant.toUpperCase()} · topo {SAFE.top}px · laterais {SAFE.side}px · base {b}px
      </div>
    </AbsoluteFill>
  );
};
