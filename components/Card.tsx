import { Box } from "@mui/material";

export function Card({ children }) {
  return (
    <Box padding="30px" borderRadius="4px" bgcolor="var(--light-bg)">
      {children}
    </Box>
  );
}
