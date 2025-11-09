import { api } from "./client";

const IS_TO_MOCK_API = import.meta.env.VITE_IS_TO_MOCK_API === "true";

interface Instruction {
  action: 'move' | 'turn';
  value: number;
}

export async function sendInstructions(instructions: Instruction[]): Promise<void> {
  if (IS_TO_MOCK_API) {
    return;
  }

  await api.post("/instructions", instructions.map(instruction => {
    return {
      action: instruction.action,
      value: instruction.value
    };
  }));
}

export interface BatteryInfo {
  percentage: number;
  remainingSeconds: number;
}

export async function getBatteryInfo(): Promise<BatteryInfo> {
  if (IS_TO_MOCK_API) {
    const percentage = Math.floor(Math.random() * 100);
    const timeRemaining = percentage;
    return {
      percentage,
      remainingSeconds: timeRemaining
    }
  }

  const { data } = await api.get<BatteryInfo>("/battery");
  return data;
}

export interface ElapsedTime {
  elapsedSecondsAfterStartup: number;
}

export async function getTimeElapsedAfterStartup() {
  if (IS_TO_MOCK_API) {
    return Math.floor(Math.random() * 120);
  }

  const { data } = await api.get<ElapsedTime>("/startup-time");
  return data;
}