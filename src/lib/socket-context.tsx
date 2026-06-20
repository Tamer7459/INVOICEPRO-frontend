"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

const Ctx = createContext<{ socket: Socket | null; connected: boolean }>({ socket: null, connected: false });
export const useSocket = () => useContext(Ctx);

export function SocketProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";
    const s = io(url);
    s.on("connect", () => { setConnected(true); if (userId) s.emit("join-user", userId); });
    s.on("disconnect", () => setConnected(false));
    setSocket(s);
    return () => { s.disconnect(); };
  }, [userId]);

  return <Ctx.Provider value={{ socket, connected }}>{children}</Ctx.Provider>;
}
