import { MicOff } from "@mui/icons-material";
import { Box, Menu, Slider } from "@mui/material";
import { useState } from "react";
import {
  useHarmonyDispatch,
  useHarmonySelector,
  userSelector,
} from "../lib/ReduxState";
import HText from "./HText";
import styles from "./SidePanelUser.module.css";
import UserRing from "./UserRing";
type Props = {
  userID: string;
};
export default function SidePanelUser({ userID }: Props) {
  const dispatch = useHarmonyDispatch();
  const isViewer = useHarmonySelector((state) => state.users.viewer === userID);
  const audioId = isViewer ? "_viewer" : userID;
  const user = useHarmonySelector((state) => userSelector(state, userID));
  const isTalking = useHarmonySelector((state) => {
    return state.clientAudioData[audioId]?.isTalking ?? false;
  });
  const volume = useHarmonySelector((state) => {
    return (
      Math.round((state.clientAudioData[audioId]?.volume ?? 0) * 200) + "%"
    );
  });
  const adjustment = useHarmonySelector((state) => {
    return Math.round((state.settings.gainAdjustments[audioId] ?? 1) * 100);
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 });
  if (!user) {
    return null;
  }
  return (
    <>
      <div
        className={styles.row}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!isViewer) {
            setMenuPos({ left: e.clientX, top: e.clientY });
            setIsMenuOpen(true);
          }
        }}
        onClick={(e) => {
          if (!isViewer) {
            setMenuPos({ left: e.clientX, top: e.clientY });
            setIsMenuOpen(true);
          }
        }}
      >
        <UserRing color={user.color} isTalking={isTalking} />
        <Box flexGrow={1}>
          <HText
            color={isTalking ? "white" : "primary"}
            weight="regular"
            size="body1"
          >
            <span className={styles.text}>{user.id}</span>
          </HText>
        </Box>
        {user.isMuted ? <MicOff fontSize="small" /> : String(volume)}
      </div>

      <Menu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorReference="anchorPosition"
        anchorPosition={{ left: menuPos.left, top: menuPos.top }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box padding="20px" minWidth="200px">
          <HText color="primary" size="body1">
            User Volume
          </HText>
          <Slider
            onChange={(e, v) =>
              dispatch({
                type: "settings/updateGainAdjustment",
                user: userID,
                volume: Array.isArray(v) ? v[0] : v,
              })
            }
            min={0}
            max={300}
            value={adjustment}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => v + "%"}
          />
        </Box>
      </Menu>
    </>
  );
}
