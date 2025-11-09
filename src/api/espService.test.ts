import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendInstructions, getBatteryInfo, getTimeElapsedAfterStartup } from './espService'
import { api } from './client'

vi.mock('./client', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('./espService', async () => {
  return await vi.importActual<typeof import('./espService')>('./espService');
})

describe('espService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendInstructions', () => {
    const mockInstructions = [
      { action: 'move' as const, value: 10 },
      { action: 'turn' as const, value: 90 },
    ]

    it('sends instructions to the API', async () => {
      await sendInstructions(mockInstructions)
      expect(api.post).toHaveBeenCalledWith('/instructions', mockInstructions)
    })

    it('handles empty instructions array', async () => {
      await sendInstructions([])
      expect(api.post).toHaveBeenCalledWith('/instructions', [])
    })
  })

  describe('getBatteryInfo', () => {
    const mockBatteryInfo = {
      percentage: 75,
      remainingSeconds: 3600,
    }

    it('returns battery info from API', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockBatteryInfo })
      const result = await getBatteryInfo()
      expect(result).toEqual(mockBatteryInfo)
      expect(api.get).toHaveBeenCalledWith('/battery')
    })
  })

  describe('getTimeElapsedAfterStartup', () => {
    const mockElapsedTime = {
      elapsedSecondsAfterStartup: 120,
    }

    it('returns elapsed time from API', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockElapsedTime })
      const result = await getTimeElapsedAfterStartup()
      expect(result).toEqual(mockElapsedTime)
      expect(api.get).toHaveBeenCalledWith('/startup-time')
    })
  })
})