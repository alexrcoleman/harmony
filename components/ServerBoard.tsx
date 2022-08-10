import React, { useRef } from "react";
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
  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <svg
        width="100%"
        height="100%"
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
