import { use } from "react";
import { SocketContext } from ".";

export const useSocketContext = () => {
  const context = use(SocketContext);
  if (context === undefined) {
    throw new Error("useProvider must be used within a SocketProvider");
  }
  return context;
}