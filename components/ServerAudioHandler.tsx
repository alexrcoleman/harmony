import { useEffect, useMemo, useRef, useState } from "react";
import { useHarmonySelector } from "../lib/ReduxState";
import ServerAudioHandlerUser from "./ServerAudioHandlerUser";

export default function ServerAudioHandler() {
  const users = useHarmonySelector((state) => {
    const server = state.servers[state.activeServer];
    return server.users.map((u) => state.users[u]);
  });
  const viewer = useHarmonySelector((state) => {
    return state.users[state.viewer];
  });

  const [audioCtx, setAudioCtx] = useState(null);
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
    if (!audioCtx) {
      return;
    }
    const listener = audioCtx.listener;
    listener.positionX.value = viewer.position.x;
    listener.positionY.value = viewer.position.y;
    listener.forwardX.value = viewer.dir.x;
    listener.forwardY.value = viewer.dir.y;
  }, [audioCtx, viewer]);

  if (!audioCtx) {
    return null;
  }
  return (
    <>
      {users
        .filter((u) => u.id !== viewer.id)
        .map((user) => (
          <ServerAudioHandlerUser
            audioCtx={audioCtx}
            user={user}
            isInViewerChannel={user.channel === viewer.channel}
            key={user.id}
          />
        ))}
    </>
  );
}
