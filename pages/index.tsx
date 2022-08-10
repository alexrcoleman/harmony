import Head from "next/head";
import { useState } from "react";
import HText from "../components/HText";
import LoginPage from "../components/LoginPage";
import Server from "../components/Server";
import { serverStore, useHarmonySelector } from "../lib/ReduxState";

export default function Home() {
  const isJoined = useHarmonySelector((s) => s.isJoined);
  if (!isJoined) {
    return <LoginPage />;
  }
  return (
    <div>
      <div style={{ paddingLeft: 20, paddingTop: 10 }}>
        {isJoined && <Server />}
      </div>
    </div>
  );
}
