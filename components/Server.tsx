import ServerBoard from "./ServerBoard";
import ServerSidePanel from "./ServerSidePanel";
import { Provider } from "react-redux";
import ServerAudioHandler from "./ServerAudioHandler";
import { useHarmonySelector } from "../lib/ReduxState";

export default function Server() {
  const server = useHarmonySelector((s) => s.servers.activeServer);
  if (!server) {
    return null;
  }
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          height: "calc(100vh - 10px)",
          justifyContent: "stretch",
          backgroundColor: "var(--light-bg)",
          borderRadius: "8px 0px 0px 0px",
          overflow: "hidden",
        }}
      >
        <ServerSidePanel />
        <ServerBoard />
        <ServerAudioHandler />
      </div>
    </div>
  );
}
