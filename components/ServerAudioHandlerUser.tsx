import { useEffect, useMemo, useRef, useState } from "react";
import { getAudioStream } from "../lib/reduxSocketMiddleware";
import { serverStore, useHarmonySelector } from "../lib/ReduxState";
import type { User } from "../shared/EntTypes";

type Props = {
  audioCtx: AudioContext;
  user: User;
  isInViewerChannel: boolean;
};
export default function ServerAudioHandlerUser({
  audioCtx,
  user,
  isInViewerChannel,
}: Props) {
  const peerId = useHarmonySelector((st) => user.socketId);
  const audioId = useHarmonySelector((st) => st.audioIds[user.socketId]);
  const panner = useMemo(
    () =>
      new PannerNode(audioCtx, {
        panningModel: "HRTF",
        distanceModel: "exponential",
        positionZ: 0,
        orientationZ: 0,
        refDistance: 1,
        maxDistance: 100000,
        rolloffFactor: 0.4,
        coneInnerAngle: 30,
        coneOuterAngle: 90,
        coneOuterGain: 0.5,
      }),
    [audioCtx]
  );
  const gainNode = useMemo(() => audioCtx.createGain(), [audioCtx]);
  const analyserNode = useMemo(() => {
    const node = audioCtx.createAnalyser();
    node.maxDecibels = 0;
    return node;
  }, [audioCtx]);

  // Update panner position
  useEffect(() => {
    panner.positionX.value = user.position.x;
    panner.positionY.value = user.position.y;
    panner.orientationX.value = user.dir.x;
    panner.orientationY.value = user.dir.y;
  }, [user]);
  // Update gain
  useEffect(() => {
    gainNode.gain.value = isInViewerChannel ? 1 : 0.5;
  }, [isInViewerChannel]);

  // Connect to audio element
  const audioElementRef = useRef<null | HTMLAudioElement>(null);
  useEffect(() => {
    // const audioElement = audioElementRef.current;
    if (audioId != null) {
      const stream = getAudioStream(peerId);
      console.log("Connecting audio stream to context:");
      console.log(stream);
      let track: AudioNode = audioCtx.createMediaStreamSource(stream);
      // audioElement.srcObject = stream;
      // let track: AudioNode = audioCtx.createMediaElementSource(audioElement);
      track = track.connect(panner);
      track = track.connect(gainNode);
      track = track.connect(analyserNode);
      track.connect(audioCtx.destination);
    }
  }, [audioId]);
  useEffect(() => {
    const pcmData = new Float32Array(analyserNode.fftSize);
    const fn = () => {
      analyserNode.getFloatTimeDomainData(pcmData);
      const peak = pcmData.reduce((max, v) => Math.max(max, v));
      serverStore.dispatch({
        type: "update_audio",
        user: user.id,
        volume: peak,
      });
    };
    const interval = setInterval(fn, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    // <div />
    // <audio id={"audio:" + user.id} ref={audioElementRef} autoPlay={false} />
    <audio ref={audioElementRef} autoPlay={false} />
  );
}
