import { Provider } from "react-redux";
import "../styles/global.css";
import {
  serverStore,
  useHarmonyDispatch,
  useHarmonySelector,
} from "../client/lib/ReduxState";
import { useEffect } from "react";
import HText from "../client/components/HText";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../client/components/theme";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={serverStore}>
      <ThemeProvider theme={theme}>
        <Head>
          <link href="/fonts/Uni Sans Heavy.otf" rel="stylesheet" />
          <link href="/fonts/Uni Sans Bold.otf" rel="stylesheet" />
          <link href="/fonts/Uni Sans SemiBold.otf" rel="stylesheet" />
          <link href="/fonts/Uni Sans Regular.otf" rel="stylesheet" />
          <link href="/fonts/Uni Sans Thin.otf" rel="stylesheet" />
          <title>Harmony</title>
        </Head>
        <Wrapper>
          <Component {...pageProps} />
        </Wrapper>
      </ThemeProvider>
    </Provider>
  );
}
function Wrapper({ children }) {
  const dispatch = useHarmonyDispatch();
  const isConnected = useHarmonySelector((store) => store.isConnected);
  useEffect(() => {
    dispatch({ type: "connect" });
  }, []);
  if (!isConnected) {
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
        <HText color="header-light">Loading...</HText>
      </div>
    );
  }
  return children;
}
