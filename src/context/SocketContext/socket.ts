import { io, Socket } from "socket.io-client";
import type { Delivery, Instruction } from "../../api/DeliveryDTO";

export interface ClientToServerEvents {
  listenInstructionsChange: (instructionsIds: string[]) => void;
  // outros eventos...
}

export interface ServerToClientEvents {
  // seus eventos do cliente...
  "instructions-change": (data: Partial<Instruction>) => void;
  "delivery-change": (data: Partial<Delivery>) => void;
  "battery-update": (data: { percentage: number }) => void;
}

const URL = import.meta.env.VITE_SOCKET_BASE_URL;
const socket: Socket<
  ServerToClientEvents,
  ClientToServerEvents
> = io(URL);

export { socket };
