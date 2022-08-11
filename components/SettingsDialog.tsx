import {
  Box,
  Checkbox,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Slider,
  Switch,
} from "@mui/material";
import { useState } from "react";
import { getAudioSettings } from "../lib/reduxSocketMiddleware";
import { serverStore, useHarmonySelector } from "../lib/ReduxState";
import HText from "./HText";

export default function SettingsDialog() {
  const { gainNode, context } = getAudioSettings();
  const isSpatialAudioEnabled = useHarmonySelector(
    (state) => state.settings.isSpatialAudioEnabled
  );
  const [volume, setVolume] = useState((gainNode?.gain.value ?? 0) * 100);
  const viewerDB = useHarmonySelector(
    (state) => state.clientAudioData["_viewer"]?.volume ?? 0
  );
  return (
    <>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box minWidth="500px">
          <Box display="flex" flexDirection="column" alignItems="stretch">
            <FormControlLabel
              control={
                <Switch
                  onClick={() =>
                    serverStore.dispatch({
                      type: "set_spatial_audio",
                      enabled: !isSpatialAudioEnabled,
                    })
                  }
                  checked={isSpatialAudioEnabled}
                />
              }
              label="Spatial Audio"
            />
            <Box display="flex" gap="20px">
              <Box flexGrow={1}>
                <HText color="header-light">Input Volume</HText>
                <Slider
                  value={volume}
                  onChange={(e, value) => {
                    if (gainNode) {
                      const percent = Array.isArray(value) ? value[0] : value;
                      const gain = percent / 100;
                      setVolume(percent);
                      console.log(gain);
                      gainNode.gain.exponentialRampToValueAtTime(
                        gain,
                        (context?.currentTime ?? 0) + 0.5
                      );
                    }
                  }}
                  min={0.1}
                  max={300}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value + "%"}
                />
              </Box>
              <Box flexGrow={1}>
                <HText color="header-light">Output Volume</HText>
                <Slider
                  value={100}
                  onChange={(e, value) => {
                    if (gainNode) {
                      // const percent = Array.isArray(value) ? value[0] : value;
                      // const gain = percent / 100;
                      // setVolume(percent);
                      // console.log(gain);
                      // gainNode.gain.exponentialRampToValueAtTime(
                      //   gain,
                      //   (context?.currentTime ?? 0) + 0.5
                      // );
                    }
                  }}
                  min={0}
                  max={300}
                  step={1}
                  disabled={true}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value + "%"}
                />
              </Box>
            </Box>
            <HText color="header-light">Input Sensitivity</HText>

            <Slider
              value={-100 + viewerDB * 100}
              min={-100}
              max={0}
              disabled={true}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => Math.round(value) + "db"}
            />
          </Box>
        </Box>
      </DialogContent>
    </>
  );
}
