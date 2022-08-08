import { Provider } from "react-redux";
import "../styles/global.css";
import { serverStore, useHarmonySelector } from "../lib/ReduxState";
import { useEffect } from "react";
import HText from "../components/HText";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={serverStore}>
      <Wrapper>
        <Component {...pageProps} />
      </Wrapper>
    </Provider>
  );
}
function Wrapper({ children }) {
  const isConnected = useHarmonySelector((store) => store.isConnected);
  useEffect(() => {
    serverStore.dispatch({ type: "connect" });
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
