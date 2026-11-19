import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EASE_OUT, WIDTH } from "../layout";
import { Easing } from "remotion";

export const Logo: React.FC<{ top: number; size: number }> = ({ top, size }) => {
  const frame = useCurrentFrame();
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const opacity = interpolate(frame, [20, 32], [0, 1], { ...opts, easing: EASE_OUT });
  const scale = interpolate(frame, [20, 40], [0.6, 1], { ...opts, easing: Easing.out(Easing.back(1.6)) });
  const y = interpolate(frame, [20, 40], [-36, 0], { ...opts, easing: EASE_OUT });
  return (
    <Img
      src={staticFile("feijoada/logo.png")}
      style={{
        position: "absolute",
        left: WIDTH / 2 - size / 2,
        top,
        width: size,
        height: size,
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))",
      }}
    />
  );
};
