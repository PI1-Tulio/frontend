import { useEffect, useState } from "react";
import { SocketContext } from ".";
import { socket } from "./socket";
import type { DeliveryWithInstructions } from "../../api/DeliveryDTO";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [delivery, setDelivery] = useState<DeliveryWithInstructions | null>(null);
  const [batteryPercentage, setBatteryPercentage] = useState<number | null>(null);

  useEffect(() => {
    socket.on("battery-update", ({ percentage }) => {
      setBatteryPercentage(percentage);
    });

    socket.on("instructions-change", (updatedInstruction) => {
      setDelivery((prevDelivery) => {
        if (!prevDelivery) return prevDelivery;

        const instructionToUpdate = prevDelivery.instructions.find((instuction) => {
          return instuction.id === updatedInstruction.id;
        });
        if (!instructionToUpdate) return prevDelivery;

        Object.assign(instructionToUpdate, updatedInstruction);
        return { ...prevDelivery };
      });
    });

    socket.on("delivery-change", (updatedDelivery) => {
      setDelivery((prevDelivery) => {
        if (!prevDelivery) return prevDelivery;

        Object.assign(prevDelivery, updatedDelivery);
        return { ...prevDelivery };
      });
    });

    return () => {
      socket.off("battery-update");
      socket.off("delivery-change");
      socket.off("instructions-change");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ delivery, setDelivery, batteryPercentage }} >
      {children}
    </SocketContext.Provider>
  )
}

