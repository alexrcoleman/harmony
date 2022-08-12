import { Mic, MicOff, Settings } from "@mui/icons-material";
import { Box, Button, Dialog, IconButton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { playNote } from "../lib/AudioUtils";
import { getLocalStream } from "../lib/reduxSocketMiddleware";
import {
  serverStore,
  useHarmonySelector,
  viewerSelector,
} from "../lib/ReduxState";
import HText from "./HText";
import SettingsDialog from "./SettingsDialog";
import UserRing from "./UserRing";

export default function SidePanelViewerBox() {
  const isMuted = useHarmonySelector((state) => state.settings.isMuted);
  const setIsMuted = (muted: boolean) =>
    serverStore.dispatch({ type: "set_muted", isMuted: muted });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const userName = useHarmonySelector((state) => viewerSelector(state)?.name);
  const userColor = useHarmonySelector((state) => viewerSelector(state)?.color);

  const onMute = () => {
    const stream = getLocalStream();
    if (stream) {
      setIsMuted(true);
      stream.getAudioTracks()[0].enabled = false;
      playNote(293.66);
      playNote(246.94, 125);
    }
  };
  const onUnmute = () => {
    const stream = getLocalStream();
    if (stream) {
      setIsMuted(false);
      stream.getAudioTracks()[0].enabled = true;
      playNote(246.94);
      playNote(293.66, 125);
    }
  };
  const onToggleMute = () => {
    const stream = getLocalStream();
    if (!stream) {
      return;
    }
    const isEnabled = stream.getAudioTracks()[0].enabled;
    if (isEnabled) {
      onMute();
    } else {
      onUnmute();
    }
  };
  useEffect(() => {
    const hook = (e) => {
      if (e.code === "F8") {
        onToggleMute();
      }
    };
    document.addEventListener("keyup", hook);
    return () => document.removeEventListener("keyup", hook);
  }, []);
  return (
    <Box
      display="flex"
      alignItems="center"
      bgcolor="var(--dark-bg)"
      padding="8px"
    >
      <Box marginRight="4px">
        <UserRing color={userColor} isTalking={false} />
      </Box>
      <Box flexGrow={1}>
        <HText color="white" size="body1">
          {userName}
        </HText>
      </Box>
      <IconButton size="small" color="secondary" onClick={onToggleMute}>
        {isMuted ? <MicOff /> : <Mic />}
      </IconButton>
      <IconButton
        size="small"
        color="secondary"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings />
      </IconButton>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <SettingsDialog />
      </Dialog>
    </Box>
  );
}
