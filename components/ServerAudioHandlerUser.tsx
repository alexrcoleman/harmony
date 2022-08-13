import { useEffect, useMemo, useRef } from "react";
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
  const peerId = user.socketId;
  const audioId = useHarmonySelector((st) => st.audioIds[user.socketId]);
  const adjustment = useHarmonySelector((state) => {
    return state.settings.gainAdjustments[user.id] ?? 1;
  });
  const panner = useMemo(
    () =>
      new PannerNode(audioCtx, {
        panningModel: "HRTF",
        distanceModel: "exponential",
        positionZ: 0,
        orientationZ: 0,
        refDistance: 1,
        maxDistance: 10000,
        rolloffFactor: 0.4,
        coneInnerAngle: 45,
        coneOuterAngle: 180,
        coneOuterGain: 0.3,
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
    const time = audioCtx.currentTime + 0.5;
    panner.positionX.linearRampToValueAtTime(user.position.x, time);
    panner.positionY.linearRampToValueAtTime(user.position.y, time);
    panner.orientationX.linearRampToValueAtTime(user.dir.x, time);
    panner.orientationY.linearRampToValueAtTime(user.dir.y, time);
  }, [user]);
  // Update gain
  useEffect(() => {
    const gain = Math.max(0.0001, adjustment * (isInViewerChannel ? 1 : 0.2));
    gainNode.gain.exponentialRampToValueAtTime(
      gain,
      audioCtx.currentTime + 0.5
    );
  }, [isInViewerChannel, adjustment]);

  // Connect to audio element
  const audioElementRef = useRef<null | HTMLAudioElement>(null);
  useEffect(() => {
    if (audioId != null) {
      serverStore.dispatch({
        type: "rtc/subscribeToPeerStream",
        peerId,
        handler: (stream) => {
          let track: AudioNode = audioCtx.createMediaStreamSource(stream);
          track = track.connect(panner);
          track = track.connect(gainNode);
          track = track.connect(analyserNode);
          track.connect(audioCtx.destination);
        },
      });
      return () => {
        panner.disconnect();
        gainNode.disconnect();
        analyserNode.disconnect();
      };
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
