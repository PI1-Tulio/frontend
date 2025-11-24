import { api } from "./client";

interface Instruction {
  potL: number;
  potR: number;
  data: {
    action: 'move' | 'turn';
    value: number;
  }[];
}

export async function sendInstructions(instructions: Instruction): Promise<void> {
  await api.post("/instructions", instructions);
}

export interface BatteryInfo {
  percentage: number;
  remainingSeconds: number;
}

export async function getBatteryInfo(): Promise<BatteryInfo> {
  const { data } = await api.get<BatteryInfo>("/battery");
  return data;
  // return {
  //   percentage: 75,
  //   remainingSeconds: 3600,
  // }
}

export interface ElapsedTime {
  elapsedSecondsAfterStartup: number;
}

export async function getTimeElapsedAfterStartup(): Promise<ElapsedTime> {
  const { data } = await api.get<ElapsedTime>("/startup-time");
  return data;
  // return {
  //   elapsedSecondsAfterStartup: 5400,
  // };
}