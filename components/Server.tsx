import ServerBoard from "./ServerBoard";
import ServerSidePanel from "./ServerSidePanel";
import { Provider } from "react-redux";
import ServerAudioHandler from "./ServerAudioHandler";
import { useHarmonySelector } from "../lib/ReduxState";

export default function Server() {
  const server = useHarmonySelector((s) => s.activeServer);
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
          height: "100vh",
          justifyContent: "stretch",
          backgroundColor: "var(--light-bg)",
          borderRadius: 8,
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
