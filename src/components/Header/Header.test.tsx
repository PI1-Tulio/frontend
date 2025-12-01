import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../../components/Header/Header'

// Mock do Socket Context
vi.mock('../../context/SocketContext/useContext', () => ({
  useSocketContext: vi.fn(() => ({
    batteryPercentage: 100
  }))
}))

function renderWithRouter(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it('renders without crashing', () => {
    renderWithRouter(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('displays battery percentage', async () => {
    const { useSocketContext } = await import('../../context/SocketContext/useContext')
    vi.mocked(useSocketContext).mockReturnValue({
      batteryPercentage: 75,
      delivery: null,
      setDelivery: vi.fn()
    })

    renderWithRouter(<Header />)
    expect(await screen.findByText('75%')).toBeInTheDocument()
  })

  it('updates battery level style based on percentage', async () => {
    const { useSocketContext } = await import('../../context/SocketContext/useContext')
    vi.mocked(useSocketContext).mockReturnValue({
      batteryPercentage: 60,
      delivery: null,
      setDelivery: vi.fn()
    })

    renderWithRouter(<Header />)
    expect(await screen.findByText('60%')).toBeInTheDocument()
  })

  it('formats time remaining correctly', async () => {
    const { useSocketContext } = await import('../../context/SocketContext/useContext')
    vi.mocked(useSocketContext).mockReturnValue({
      batteryPercentage: 100,
      delivery: null,
      setDelivery: vi.fn()
    })

    renderWithRouter(<Header />)
    expect(await screen.findByText('100%')).toBeInTheDocument()
  })
})