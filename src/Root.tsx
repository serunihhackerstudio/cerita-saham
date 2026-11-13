import React from "react";
import {Composition, staticFile} from "remotion";
import {VIDEO} from "./config";
import {Thumbnail} from "./Thumbnail";
import {DEFAULT_TIMING, FPS, Timing, sceneFrames} from "./timing";
import {Video, VideoProps} from "./Video";

const loadTiming = async (props: VideoProps) => {
  let timing: Timing = props.timing;
  try {
    const res = await fetch(staticFile("audio/timing.json"));
    if (res.ok) timing = (await res.json()) as Timing;
  } catch {
    // timing.json belum ada: pakai durasi naskah
  }
  return {durationInFrames: timing.scenes.map(sceneFrames).reduce((a, b) => a + b, 0), props: {...props, timing}};
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id={VIDEO.compositionId}
      component={Video}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={DEFAULT_TIMING.scenes.map(sceneFrames).reduce((a, b) => a + b, 0)}
      defaultProps={{timing: DEFAULT_TIMING} as VideoProps}
      calculateMetadata={({props}) => loadTiming(props)}
    />
    <Composition id="Thumbnail" component={Thumbnail} width={1080} height={1920} fps={FPS} durationInFrames={1} />
  </>
);
