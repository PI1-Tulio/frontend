import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithRouter } from '../../test/utils'
import { Instrucao } from '../../pages/instrucao/Instrucao'
import { createDelivery } from '../../api/deliveryService'

vi.mock('../../api/deliveryService', () => ({
  createDelivery: vi.fn().mockResolvedValue({
    id: 1,
    name: 'Test Delivery',
    potL: 200,
    potR: 200,
    startTime: '2025-11-30T10:00:00.000Z',
    endTime: '2025-11-30T10:10:00.000Z',
  }),
}))

// Mock do Socket Context
vi.mock('../../context/SocketContext/useContext', () => ({
  useSocketContext: vi.fn(() => ({
    batteryPercentage: 100,
    delivery: null,
    setDelivery: vi.fn()
  }))
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

    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'TURN' } })
    expect(selects[0]).toHaveValue('TURN')
  })

  it('sends instructions when Confirm button is clicked', async () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)

    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    fireEvent.click(confirmButton)

    const mock = vi.mocked(createDelivery)
    expect(mock).toHaveBeenCalled()
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

  it('should add multiple instructions', () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })

    fireEvent.click(addButton)
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    expect(screen.getByText('Instrução 1')).toBeInTheDocument()
    expect(screen.getByText('Instrução 2')).toBeInTheDocument()
    expect(screen.getByText('Instrução 3')).toBeInTheDocument()
  })

  it('should allow deleting individual instructions', () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })

    // Adicionar duas instruções
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    expect(screen.getByText('Instrução 1')).toBeInTheDocument()
    expect(screen.getByText('Instrução 2')).toBeInTheDocument()

    // Deletar a primeira instrução
    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir instrução' })
    fireEvent.click(deleteButtons[0])

    // Deve haver apenas uma instrução restante
    const remainingDeleteButtons = screen.getAllByRole('button', { name: 'Excluir instrução' })
    expect(remainingDeleteButtons).toHaveLength(1)
  })
})
describe('Instrucao - Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update instruction values', () => {
    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)

    const valueInputs = screen.getAllByRole('textbox')
    const instructionValueInput = valueInputs.find(input => input.getAttribute('class')?.includes('valueInput'))

    if (instructionValueInput) {
      fireEvent.change(instructionValueInput, { target: { value: '50' } })
      expect(instructionValueInput).toHaveValue('50')
    }
  })

  it('should handle error when creating delivery fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
    vi.mocked(createDelivery).mockRejectedValueOnce(new Error('Network error'))

    renderWithRouter(<Instrucao />)
    const addButton = screen.getByRole('button', { name: 'Adicionar' })
    fireEvent.click(addButton)

    const confirmButton = screen.getByRole('button', { name: 'Confirmar' })
    fireEvent.click(confirmButton)

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating delivery:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should update potL and potR values', () => {
    renderWithRouter(<Instrucao />)

    const inputs = screen.getAllByRole('spinbutton')
    const potLInput = inputs[0]
    const potRInput = inputs[1]

    fireEvent.change(potLInput, { target: { value: '75' } })
    fireEvent.change(potRInput, { target: { value: '85' } })

    expect(potLInput).toHaveValue(75)
    expect(potRInput).toHaveValue(85)
  })

  it('should update delivery name', () => {
    renderWithRouter(<Instrucao />)

    const nameInput = screen.getByDisplayValue('Entrega 1')
    fireEvent.change(nameInput, { target: { value: 'Nova Entrega' } })

    expect(nameInput).toHaveValue('Nova Entrega')
  })
})
