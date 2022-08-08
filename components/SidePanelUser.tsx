import { useHarmonySelector } from "../lib/ReduxState";
import HText from "./HText";
import styles from "./SidePanelUser.module.css";
type Props = {
  userID: string;
};
export default function SidePanelUser({ userID }: Props) {
  const user = useHarmonySelector((state) => {
    return state.users[userID];
  });
  return (
    <div className={styles.row}>
      <div
        style={{
          backgroundColor: user.color,
          borderRadius: 100,
          width: 16,
          height: 16,
          opacity: 0.3,
        }}
      />
      <HText color="primary" weight="regular">
        <span className={styles.text}>{user.id}</span>
      </HText>
    </div>
  );
}
