import { Dispatch } from "@reduxjs/toolkit";
import { Middleware } from "redux";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../shared/SocketTypes";
import { HarmonyAction, HarmonyState, serverStore } from "./ReduxState";
import { RTCPoolData, setupWebRTC } from "./WebRTCSetup";

export type HarmonySocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export type SocketMiddleware = Middleware<
  {},
  HarmonyState,
  Dispatch<HarmonyAction>
>;
const reduxSocketMiddleware: SocketMiddleware = (store) => {
  let socket: HarmonySocket | undefined;
  let rtcData: RTCPoolData | undefined;

  const debouncedFace = debounce(({ x, y }: { x: number; y: number }) =>
    socket?.emit("face", { x: x, y: y })
  );

  return (next) => async (action: HarmonyAction) => {
    // Connect and setup socket hooks:
    if (action.type === "connect") {
      await fetch("/api/socket");
      socket = io();

      socket.on("connect", () => {
        store.dispatch({ type: "connected" });
      });

      socket.on("updateUser", (user) => {
        store.dispatch({ type: "user", user });
      });
      socket.on("updateServer", (server) => {
        store.dispatch({ type: "server", server });
      });

      socket.on("removeUser", (id) => {
        store.dispatch({ type: "removeUser", id });
      });
      return;
    }

    // Actions to send over socket:
    if (socket && store.getState().isConnected) {
      if (action.type === "login") {
        if (!rtcData) {
          rtcData = await setupWebRTC(socket);
        }
        socket.emit("login", action.id, (success, data) => {
          if (success && data) {
            store.dispatch({ type: "joined", id: action.id, data });
          } else {
            alert("Failed to join");
          }
        });
      }
      if (action.type === "move") {
        socket.emit("move", { x: action.x, y: action.y });
      }
      if (action.type === "face") {
        debouncedFace(action);
      }
      if (action.type === "logout") {
        socket.emit("logout");
      }
      if (action.type === "settings/setMuted") {
        socket.emit("set_muted", action.isMuted);
      }
    }

    if (rtcData) {
      if (action.type === "settings/updateLocalInputGain") {
        const gain = action.volume / 100;
        rtcData.gainNode.gain.exponentialRampToValueAtTime(
          gain,
          (rtcData.context.currentTime ?? 0) + 0.5
        );
      }
      if (action.type == "settings/setMuted") {
        rtcData.localStream.getAudioTracks()[0].enabled = !action.isMuted;
      }
      if (action.type === "rtc/subscribeToPeerStream") {
        const stream = rtcData.peerStreams[action.peerId];
        if (stream) {
          action.handler(stream);
        }
      }
    }

    next(action);
  };
};

function debounce<TFn extends Function>(fn: TFn): TFn {
  let lastTime = 0;
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: any) => {
    if (timeout != null) {
      clearTimeout(timeout);
    }
    const delay = Math.min(250, lastTime + 250 - Date.now());
    const wrapperFn = () => {
      lastTime = Date.now();
      fn(...args);
    };
    if (delay <= 0) {
      wrapperFn();
    } else {
      timeout = setTimeout(wrapperFn, delay);
    }
  }) as unknown as TFn;
}

export default reduxSocketMiddleware;
