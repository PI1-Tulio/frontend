import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmButton from '../../components/ConfirmButton/ConfirmButton'

describe('ConfirmButton', () => {
  it('renders without crashing', () => {
    render(<ConfirmButton onClick={() => { }} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<ConfirmButton onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<ConfirmButton onClick={() => { }} disabled={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is enabled by default', () => {
    render(<ConfirmButton onClick={() => { }} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})