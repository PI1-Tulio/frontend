import { vi } from 'vitest';

const mockEspService = {
  getBatteryInfo: vi.fn().mockResolvedValue({
    percentage: 100,
    remainingSeconds: 60,
  }),
  sendInstructions: vi.fn().mockResolvedValue(undefined),
  getTimeElapsedAfterStartup: vi.fn().mockResolvedValue({
    elapsedSecondsAfterStartup: 0,
  }),
};

vi.mock('../api/espService', () => {
  return {
    getBatteryInfo: mockEspService.getBatteryInfo,
    sendInstructions: mockEspService.sendInstructions,
    getTimeElapsedAfterStartup: mockEspService.getTimeElapsedAfterStartup,
  }
});