import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InstructionCard } from '../../components/InstructionCard/InstructionCard'

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => { },
    transform: null,
    transition: null,
  }),
}))

describe('InstructionCard', () => {
  const defaultProps = {
    id: 1,
    instructionNumber: 1,
    action: 'MOVE' as const,
    value: 0,
    onDelete: vi.fn(),
    onUpdate: vi.fn(),
  }

  it('renders with move action', () => {
    render(<InstructionCard {...defaultProps} />)
    expect(screen.getByText('Instrução 1')).toBeInTheDocument()
    const selects = screen.getAllByRole('combobox')
    expect(selects[0]).toHaveValue('MOVE')
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('0')
  })

  it('renders with turn action', () => {
    render(
      <InstructionCard {...defaultProps} action="TURN" />
    )
    const selects = screen.getAllByRole('combobox')
    const actionSelect = selects[0]
    expect(actionSelect).toHaveValue('TURN')
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<InstructionCard {...defaultProps} />)
    const deleteButton = screen.getByRole('button')
    fireEvent.click(deleteButton)
    expect(defaultProps.onDelete).toHaveBeenCalledWith(1)
  })

  it('calls onUpdate when action changes', () => {
    render(<InstructionCard {...defaultProps} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'TURN' } })
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(1, 'TURN', 0)
  })

  it('calls onUpdate when value changes in move mode', () => {
    render(<InstructionCard {...defaultProps} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '10' } })
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(1, 'MOVE', 10)
  })

  it('calls onUpdate when direction changes in turn mode', () => {
    render(<InstructionCard {...defaultProps} action="TURN" />)
    const select = screen.getAllByRole('combobox')[1] // get the second combobox (direction select)
    fireEvent.change(select, { target: { value: '1' } })
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(1, 'TURN', 1)
  })
})