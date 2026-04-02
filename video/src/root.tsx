import { AbsoluteFill, Composition } from "remotion";
import { PromotionalVideo } from "./PromotionalVideo";

export const Root = () => {
  return (
    <Composition
      id="promotional-video"
      component={PromotionalVideo}
      durationInFrames={790}
      fps={30}
      width={3840}
      height={2160}
    />
  );
};
