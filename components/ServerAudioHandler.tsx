import { useEffect, useMemo, useRef, useState } from "react";
import {
  serverSelector,
  useHarmonySelector,
  userSelector,
  viewerSelector,
} from "../lib/ReduxState";
import { User } from "../shared/EntTypes";
import ServerAudioHandlerUser from "./ServerAudioHandlerUser";

export default function ServerAudioHandler() {
  const users = useHarmonySelector(
    (state) => {
      return (
        serverSelector(state)?.users.map((u) => userSelector(state, u)) ?? []
      );
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  const viewer = useHarmonySelector(viewerSelector);

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  useEffect(() => {
    const audioCtx = new window.AudioContext();
    setAudioCtx(audioCtx);
    // const gainNode = audioCtx.createGain();
    // gainNode.gain.value = 0.2;
    // gainNode.connect(audioCtx.destination);

    const listener = audioCtx.listener;

    listener.positionZ.value = 0;
    listener.forwardZ.value = 0;
    listener.upX.value = 0;
    listener.upY.value = 0;
    listener.upZ.value = -1;
    return () => {
      audioCtx.close();
    };
  }, []);
  useEffect(() => {
    if (!audioCtx || !viewer) {
      return;
    }
    const listener = audioCtx.listener;
    const time = audioCtx.currentTime + 0.2;
    listener.positionX.linearRampToValueAtTime(viewer.position.x, time);
    listener.positionY.linearRampToValueAtTime(viewer.position.y, time);
    listener.forwardX.linearRampToValueAtTime(viewer.dir.x, time);
    listener.forwardY.linearRampToValueAtTime(viewer.dir.y, time);
  }, [audioCtx, viewer]);

  if (!audioCtx) {
    return null;
  }
  return (
    <>
      {(users.filter((u) => u != null && u.id !== viewer?.id) as User[]).map(
        (user) => (
          <ServerAudioHandlerUser
            audioCtx={audioCtx}
            user={user}
            isInViewerChannel={user.channel === viewer?.channel}
            key={user.id}
          />
        )
      )}
    </>
  );
}
