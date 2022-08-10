import { Box, Button, FilledInput, TextField } from "@mui/material";
import { useState } from "react";
import { serverStore } from "../lib/ReduxState";
import { Card } from "./Card";
import HText from "./HText";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!username) {
              return;
            }
            serverStore.dispatch({ type: "login", id: username });
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            minWidth="400px"
          >
            <HText color="white" weight="bold" size="h1">
              Harmony
            </HText>
            <HText color="secondary" size="body1">
              We are in accord
            </HText>
            <Box paddingTop="20px" alignSelf="stretch">
              <TextField
                variant="filled"
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Box>
            {/* <Box paddingTop="20px" alignSelf="stretch">
              <TextField variant="filled" label="Password" fullWidth />
            </Box> */}
            <Box paddingTop="30px" alignSelf="stretch">
              <Button fullWidth variant="contained" type="submit">
                Login
              </Button>
            </Box>
          </Box>
        </form>
      </Card>
    </div>
  );
}
