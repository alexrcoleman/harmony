import { useEffect, useMemo, useRef, useState } from "react";
import { useHarmonySelector } from "../lib/ReduxState";
import ServerAudioHandlerUser from "./ServerAudioHandlerUser";

export default function ServerAudioHandler() {
  const users = useHarmonySelector(
    (state) => {
      const server = state.servers[state.activeServer];
      return server.users.map((u) => state.users[u]);
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  const viewer = useHarmonySelector((state) => {
    if (state.viewer == null) {
      return null;
    }
    return state.users[state.viewer];
  });

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  useEffect(() => {
    const audioCtx = new window.AudioContext();
    setAudioCtx(audioCtx);

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
    const time = audioCtx.currentTime + 0.5;
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
      {users
        .filter((u) => u.id !== viewer?.id)
        .map((user) => (
          <ServerAudioHandlerUser
            audioCtx={audioCtx}
            user={user}
            isInViewerChannel={user.channel === viewer?.channel}
            key={user.id}
          />
        ))}
    </>
  );
}
