import { api } from "./client";

interface Instruction {
  action: 'move' | 'turn';
  value: number;
}

export async function sendInstructions(instructions: Instruction[]): Promise<void> {
  await api.post("/instructions", instructions);
}

export interface BatteryInfo {
  percentage: number;
  remainingSeconds: number;
}

export async function getBatteryInfo(): Promise<BatteryInfo> {
  const { data } = await api.get<BatteryInfo>("/battery");
  return data;
}

export interface ElapsedTime {
  elapsedSecondsAfterStartup: number;
}

export async function getTimeElapsedAfterStartup(): Promise<ElapsedTime> {
  const { data } = await api.get<ElapsedTime>("/startup-time");
  return data;
}