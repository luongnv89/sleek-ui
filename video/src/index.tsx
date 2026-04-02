import { registerRoot } from "remotion";
import { Composition } from "remotion";
import { PromotionalVideo } from "./PromotionalVideo";

registerRoot(() => (
  <Composition
    id="promotional-video"
    component={PromotionalVideo}
    durationInFrames={1020}
    fps={30}
    width={1920}
    height={1080}
  />
));
