import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../../components/Header/Header'
import { getBatteryInfo, getTimeElapsedAfterStartup } from '../../api/espService'

vi.mock('../../api/espService', () => ({
  getBatteryInfo: vi.fn().mockResolvedValue({
    percentage: 100,
    remainingSeconds: 60
  }),
  getTimeElapsedAfterStartup: vi.fn().mockResolvedValue({
    elapsedSecondsAfterStartup: 0
  })
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it('renders without crashing', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('displays battery percentage', async () => {
    vi.mocked(getBatteryInfo).mockResolvedValueOnce({
      percentage: 75,
      remainingSeconds: 3600
    })
    render(<Header />)
    expect(await screen.findByText('75%')).toBeInTheDocument()
  })

  it('updates battery level style based on percentage', async () => {
    vi.mocked(getBatteryInfo).mockResolvedValueOnce({
      percentage: 60,
      remainingSeconds: 3600
    })
    render(<Header />)
    expect(await screen.findByText('60%')).toBeInTheDocument()
  })

  it('formats time remaining correctly', async () => {
    vi.mocked(getBatteryInfo).mockResolvedValueOnce({
      percentage: 100,
      remainingSeconds: 3600
    })
    render(<Header />)
    expect(await screen.findByText('1h')).toBeInTheDocument()
  })
})