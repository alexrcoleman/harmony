import { useHarmonySelector } from "../lib/ReduxState";
import HText from "./HText";
import styles from "./SidePanelUser.module.css";
import UserRing from "./UserRing";
type Props = {
  userID: string;
};
export default function SidePanelUser({ userID }: Props) {
  const isViewer = useHarmonySelector((state) => state.viewer === userID);
  const audioId = isViewer ? "_viewer" : userID;
  const user = useHarmonySelector((state) => {
    return state.users[userID];
  });
  const isTalking = useHarmonySelector((state) => {
    return state.clientAudioData[audioId]?.isTalking ?? false;
  });
  const volume = useHarmonySelector((state) => {
    return (
      Math.round((state.clientAudioData[audioId]?.volume ?? 0) * 200) + "%"
    );
  });
  return (
    <div className={styles.row}>
      <UserRing color={user.color} isTalking={isTalking} />
      <HText
        color={isTalking ? "white" : "primary"}
        weight="regular"
        size="body1"
      >
        <span className={styles.text}>{user.id}</span>
      </HText>
      {String(volume)}
    </div>
  );
}
