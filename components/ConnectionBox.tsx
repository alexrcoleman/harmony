import { Logout } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useRouter } from "next/router";

export default function ConnectionBox() {
  const router = useRouter();
  return (
    <Box
      display="flex"
      borderBottom="1px solid #3a3f45"
      padding="8px"
      bgcolor="var(--dark-bg)"
    >
      <Box flexGrow="1" />
      <IconButton
        onClick={() => router.reload()}
        size="small"
        color="secondary"
      >
        <Logout />
      </IconButton>
    </Box>
  );
}
