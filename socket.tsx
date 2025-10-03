// ── src/sa/socket.ts ───────────────────────────────────────────────
import { io, Socket } from "socket.io-client";
import config from "../config";

export const socket: Socket = io(config.socketURL || "http://localhost:4000/sa");
