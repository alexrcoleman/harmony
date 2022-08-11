import { useHarmonySelector } from "../lib/ReduxState";
import HText from "./HText";
import SidePanelUser from "./SidePanelUser";

export default function SidePanelChannel({
  channel: channelID,
}: {
  channel: string | null;
}) {
  const users = useHarmonySelector(
    (state) => {
      return state.servers[state.activeServer].users
        .map((u) => state.users[u])
        .filter((user) => user != null && user.channel === channelID);
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  const channel = useHarmonySelector((state) => {
    if (channelID == null) {
      return null;
    }
    return state.channels[channelID];
  });
  const viewer = useHarmonySelector((state) => state.viewer);
  return (
    <div style={{ fontSize: 14 }}>
      <HText
        color={
          users.find((u) => u.id === viewer) != null ? "header-light" : "header"
        }
        size="h3"
        weight="semibold"
      >
        {channel === null ? "dead or what?" : channel.name}
      </HText>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {users.map((user) => (
          <SidePanelUser userID={user.id} key={user.id} />
        ))}
      </div>
    </div>
  );
}
