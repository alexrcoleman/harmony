import { NextApiResponse } from "next";
import http from "http";
import SocketIOServer from "../../server/SocketIOServer";

type SocketType = { server: http.Server & { io: unknown } } | null;

const SocketHandler = (req, res: NextApiResponse) => {
  const socket = res.socket as SocketType;
  if (!socket) {
    res.status(500).end();
    return;
  }
  const server = socket.server;
  if (server.io) {
    res.status(200).end();
    return;
  }
  const io = SocketIOServer.setupServer(server);
  server.io = io;
  res.status(200).end();
};

export default SocketHandler;
