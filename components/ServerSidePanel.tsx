import Box from "@mui/material/Box";
import { useHarmonySelector } from "../lib/ReduxState";
import { useRouter } from "next/router";
import HText from "./HText";
import SidePanelChannel from "./SidePanelChannel";
import SidePanelUser from "./SidePanelUser";
import SidePanelViewerBox from "./SidePanelViewerBox";
import { Button } from "@mui/material";
import ConnectionBox from "./ConnectionBox";

export default function ServerSidePanel() {
  const router = useRouter();
  const serverName = useHarmonySelector((state) => {
    return state.servers[state.activeServer].name;
  });
  const channels = useHarmonySelector((state) => {
    return state.servers[state.activeServer].channels;
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg)",
        minWidth: "250px",
        userSelect: "none",
      }}
    >
      <Box padding="10px" borderBottom="1px solid #212328">
        <HText size="h2" color="white">
          {serverName}
        </HText>
      </Box>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          padding: "20px",
        }}
        flexGrow={1}
        overflow="auto"
      >
        {channels.map((c) => (
          <SidePanelChannel channel={c} key={c} />
        ))}
      </Box>
      <ConnectionBox />
      <Box>
        <SidePanelViewerBox />
      </Box>
    </div>
  );
}
