import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AddButton from '../../components/Button/AddButton'

describe('AddButton', () => {
  it('renders without crashing', () => {
    render(<AddButton onClick={() => { }} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<AddButton onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<AddButton onClick={() => { }} disabled={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is enabled by default', () => {
    render(<AddButton onClick={() => { }} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})