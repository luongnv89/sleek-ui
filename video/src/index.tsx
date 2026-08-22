import { registerRoot } from "remotion";
import { Composition } from "remotion";
import { PromotionalVideo, TOTAL_FRAMES } from "./PromotionalVideo";

registerRoot(() => (
  <Composition
    id="promotional-video"
    component={PromotionalVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1920}
    height={1080}
  />
));
