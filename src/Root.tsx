import { Composition } from "remotion";
import { FeijoadaProps, FeijoadaReels, FeijoadaStories } from "./feijoada/Feijoada";
import { DURATION, FPS, HEIGHT, WIDTH } from "./feijoada/layout";

const defaults: FeijoadaProps = { showSafeZone: false };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FeijoadaStories"
      component={FeijoadaStories}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaults}
    />
    <Composition
      id="FeijoadaReels"
      component={FeijoadaReels}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaults}
    />
  </>
);
