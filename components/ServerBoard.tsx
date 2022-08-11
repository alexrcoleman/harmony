import React, { useEffect, useRef, useState } from "react";
import { serverStore, useHarmonySelector } from "../lib/ReduxState";

export default function ServerBoard() {
  const channels = useHarmonySelector(
    (state) => {
      const server = state.servers[state.activeServer];
      return server.channels.map((channelID) => state.channels[channelID]);
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  const users = useHarmonySelector(
    (state) => {
      const server = state.servers[state.activeServer];
      return server.users.map((id) => state.users[id]);
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [isLeft, setLeft] = useState(false);
  const [isRight, setRight] = useState(false);
  const [isDown, setDown] = useState(false);
  const [isUp, setUp] = useState(false);
  useEffect(() => {
    if (!isLeft && !isRight && !isDown && !isUp) {
      return;
    }

    const timeout = setInterval(() => {
      const st = serverStore.getState();
      const speed = 5;
      if (isUp || isDown) {
        const scale = isUp ? speed : -speed;
        const u = st.users[st.viewer ?? ""];
        const p = u.position;
        const d = u.dir;
        serverStore.dispatch({
          type: "move",
          x: p.x + d.x * scale,
          y: p.y + d.y * scale,
        });
      }
      if (isLeft || isRight) {
        const scale = isRight ? 2 : -2;
        const u = st.users[st.viewer ?? ""];
        const p = u.position;
        const d = u.dir;
        serverStore.dispatch({
          type: "face",
          x: p.x + (d.x * 5 - d.y * scale) * 10,
          y: p.y + (d.y * 5 + d.x * scale) * 10,
        });
      }
    }, 50);
    return () => clearTimeout(timeout);
  }, [isLeft, isRight, isDown, isUp]);
  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <svg
        width="100%"
        height="100%"
        tabIndex={0}
        onMouseDown={(e) => {
          const rect = (svgRef.current as SVGElement).getBoundingClientRect();
          const x = e.clientX - rect.left; //x position within the element.
          const y = e.clientY - rect.top;
          dragStart.current = { x, y };
          serverStore.dispatch({ type: "move", x, y });
        }}
        onMouseMove={(e) => {
          if (dragStart.current != null) {
            e.preventDefault();
            const rect = (svgRef.current as SVGElement).getBoundingClientRect();
            const x = e.clientX - rect.left; //x position within the element.
            const y = e.clientY - rect.top;
            serverStore.dispatch({ type: "face", x, y });
          }
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          dragStart.current = null;
        }}
        onKeyDown={(e) => {
          if (e.code === "ArrowRight") {
            setRight(true);
          }
          if (e.code === "ArrowUp") {
            setUp(true);
          }
          if (e.code === "ArrowDown") {
            setDown(true);
          }
          if (e.code === "ArrowLeft") {
            setLeft(true);
          }
        }}
        onKeyUp={(e) => {
          if (e.code === "ArrowRight") {
            setRight(false);
          }
          if (e.code === "ArrowUp") {
            setUp(false);
          }
          if (e.code === "ArrowDown") {
            setDown(false);
          }
          if (e.code === "ArrowLeft") {
            setLeft(false);
          }
        }}
        ref={svgRef}
      >
        {channels.map((c) => (
          <React.Fragment key={c.name}>
            <path
              d={
                "M " +
                c.border.map(([x, y]) => x + " " + y + " L ").join("") +
                c.border[0][0] +
                " " +
                c.border[0][1]
              }
              fill="var(--dark-bg)"
              stroke="#fff8"
            />
            <text
              x={c.border[0][0] + 8}
              y={c.border[0][1] + 23}
              fill="var(--header-text)"
              style={{ userSelect: "none" }}
            >
              {c.name}
            </text>
          </React.Fragment>
        ))}
        {users.map((u) => (
          <React.Fragment key={u.id}>
            <circle
              cx={u.position.x}
              cy={u.position.y}
              r="10"
              fill={u.color}
              opacity={0.5}
            />
            <circle
              cx={u.position.x + u.dir.x * 6 - u.dir.y * 3}
              cy={u.position.y + u.dir.y * 6 + u.dir.x * 3}
              r="2"
              fill="white"
            />
            <circle
              cx={u.position.x + u.dir.x * 6 + u.dir.y * 3}
              cy={u.position.y + u.dir.y * 6 - u.dir.x * 3}
              r="2"
              fill="white"
            />
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
}
