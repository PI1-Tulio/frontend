import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithRouter } from '../../test/utils'
import { Instrucao } from '../../pages/instrucao/Instrucao'
import { sendInstructions } from '../../api/espService'

vi.mock('../../api/espService', () => ({
  sendInstructions: vi.fn().mockResolvedValue(undefined),
  getBatteryInfo: vi.fn().mockResolvedValue({
    percentage: 100,
    remainingSeconds: 60
  }),
  getTimeElapsedAfterStartup: vi.fn().mockResolvedValue({
    elapsedSecondsAfterStartup: 0
  })
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  closestCenter: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => { },
    transform: null,
    transition: null,
  }),
}))

describe('Instrucao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial state correctly', () => {
    renderWithRouter(<Instrucao />)
    expect(screen.getByText('Insira as Instruções')).toBeInTheDocument()
    expect(screen.getByText('As instruções aparecem aqui!')).toBeInTheDocument()
  })

  it('adds a new instruction when Add button is clicked', () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)
    expect(screen.getByText('Instrução 1')).toBeInTheDocument()
  })

  it('deletes all instructions when Cancel button is clicked', async () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)
    expect(screen.getByText('Instrução 1')).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    fireEvent.click(cancelButton)
    expect(screen.getByText('As instruções aparecem aqui!')).toBeInTheDocument()
  })

  it('updates instruction when action is changed', () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'turn' } })
    expect(select).toHaveValue('turn')
  })

  it('sends instructions when Confirm button is clicked', async () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)

    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    fireEvent.click(confirmButton)

    const mock = vi.mocked(sendInstructions)
    expect(mock).toHaveBeenCalledWith({ potL: 100, potR: 100, data: [{ id: 1, action: 'move', value: 0 }] })
  })

  it('disables buttons during instruction sending', async () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)

    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })

    fireEvent.click(confirmButton)

    expect(confirmButton).toBeDisabled()
    expect(addButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })
})