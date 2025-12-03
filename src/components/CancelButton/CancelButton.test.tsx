import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CancelButton from '../../components/CancelButton/CancelButton'

describe('CancelButton', () => {
  it('renders without crashing', () => {
    render(<CancelButton onClick={() => { }} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<CancelButton onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<CancelButton onClick={() => { }} disabled={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is enabled by default', () => {
    render(<CancelButton onClick={() => { }} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})