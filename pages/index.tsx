import { Box } from "@mui/material";
import LoginPage from "../client/components/LoginPage";
import Server from "../client/components/Server";
import { useHarmonySelector } from "../client/lib/ReduxState";

export default function Home() {
  const isJoined = useHarmonySelector((s) => s.isJoined);
  if (!isJoined) {
    return <LoginPage />;
  }
  return (
    <Box paddingLeft="20px" paddingTop="10px">
      {isJoined && <Server />}
    </Box>
  );
}
