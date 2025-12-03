import { createContext } from "react";
import type { DeliveryWithInstructions } from "../../api/DeliveryDTO";

export interface SocketContextData {
  delivery: DeliveryWithInstructions | null;
  setDelivery: (delivery: DeliveryWithInstructions | null) => void;
  batteryPercentage?: number | null;
}

export const SocketContext = createContext<SocketContextData | null>(null);
