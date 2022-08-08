import Head from "next/head";
import { useState } from "react";
import Server from "../components/Server";
import { serverStore, useHarmonySelector } from "../lib/ReduxState";

export default function Home() {
  const isJoined = useHarmonySelector((s) => s.isJoined);
  return (
    <div>
      <Head>
        <title>Harmony</title>
      </Head>
      <div style={{ paddingLeft: 20 }}>
        <div style={{ height: 30 }}>
          <button
            onClick={() => {
              if (isJoined) {
                serverStore.dispatch({ type: "logout" });
                return;
              }
              const id = prompt("Enter username");
              if (!id) {
                return;
              }
              serverStore.dispatch({ type: "login", id });
            }}
          >
            {isJoined ? "Disconnect" : "Join"}
          </button>
        </div>
        {isJoined && <Server />}
      </div>
    </div>
  );
}
