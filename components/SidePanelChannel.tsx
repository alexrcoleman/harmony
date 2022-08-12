import {
  serverSelector,
  serverStore,
  useHarmonySelector,
  userSelector,
  viewerSelector,
} from "../lib/ReduxState";
import HText from "./HText";
import SidePanelUser from "./SidePanelUser";
import styles from "./SidePanelChannel.module.css";
import { useMemo } from "react";
import { User } from "../shared/EntTypes";

export default function SidePanelChannel({
  channel: channelID,
}: {
  channel: string | null;
}) {
  const users = useHarmonySelector(
    (state) => {
      return (serverSelector(state)?.users ?? [])
        .map((u) => userSelector(state, u))
        .filter((user) => user != null && user.channel === channelID) as User[];
    },
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
  const channel = useHarmonySelector((state) => {
    if (channelID == null) {
      return null;
    }
    return state.channels[channelID];
  });

  let { cx, cy } = useMemo(() => {
    let cx = 0,
      cy = 0;
    for (let b of channel?.border ?? []) {
      cx += b[0];
      cy += b[1];
    }
    cx /= (channel?.border ?? []).length;
    cy /= (channel?.border ?? []).length;
    return { cx: isNaN(cx) ? 0 : cx, cy: isNaN(cy) ? 0 : cy };
  }, [channel]);
  const viewer = useHarmonySelector((state) => viewerSelector(state)?.id);
  return (
    <div style={{ fontSize: 14 }}>
      <div
        className={styles.row}
        style={{ cursor: "pointer" }}
        onClick={() => {
          const x = (isNaN(cx) ? 0 : cx) + Math.floor(Math.random() * 40 - 20);
          const y = (isNaN(cy) ? 0 : cy) + Math.floor(Math.random() * 40 - 20);
          serverStore.dispatch({ type: "move", x, y });
          serverStore.dispatch({ type: "face", x: cx, y: cy });
        }}
      >
        <HText
          color={
            users.find((u) => u.id === viewer) != null
              ? "header-light"
              : "header"
          }
          size="h3"
          weight="semibold"
        >
          {channel === null ? "dead or what?" : channel.name}
        </HText>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          paddingLeft: "12px",
          paddingTop: "2px",
        }}
      >
        {users.map((user) => (
          <SidePanelUser userID={user.id} key={user.id} />
        ))}
      </div>
    </div>
  );
}
