import { AbsoluteFill, Img, staticFile } from "remotion";

export const Background: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile("feijoada/bg.png")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);
