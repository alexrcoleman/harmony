import { useHarmonySelector } from "../lib/ReduxState";
import SidePanelChannel from "./SidePanelChannel";
import SidePanelUser from "./SidePanelUser";

export default function ServerSidePanel() {
  const channels = useHarmonySelector((state) => {
    return state.servers[state.activeServer].channels;
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 20,
        backgroundColor: "var(--bg)",
        minWidth: "250px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {channels.map((c) => (
          <SidePanelChannel channel={c} key={c} />
        ))}
      </div>
    </div>
  );
}
