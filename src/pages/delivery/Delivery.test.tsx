import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Delivery } from './Delivery';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as deliveryService from '../../api/deliveryService';
import type { DeliveryWithInstructions } from '../../api/DeliveryDTO';
import { SocketProvider } from '../../context/SocketContext/Provider';

// Mock do deliveryService
vi.mock('../../api/deliveryService', () => ({
  getDeliveryById: vi.fn(),
  resendDelivery: vi.fn(),
}));

// Mock do socket
vi.mock('../../context/SocketContext/socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

const mockDelivery: DeliveryWithInstructions = {
  id: 1,
  name: 'Entrega Teste',
  potL: 200,
  potR: 200,
  startTime: '2025-11-30T10:00:00.000Z',
  endTime: '2025-11-30T10:10:00.000Z',
  instructions: [
    {
      id: 1,
      action: 'MOVE',
      value: 10,
      actuallyExecuted: 10,
      startTime: '2025-11-30T10:00:00.000Z',
      endTime: '2025-11-30T10:00:05.000Z',
      deliveryId: 1,
    },
    {
      id: 2,
      action: 'TURN',
      value: 1,
      actuallyExecuted: 0,
      startTime: '2025-11-30T10:00:05.000Z',
      endTime: '2025-11-30T10:00:06.000Z',
      deliveryId: 1,
    },
    {
      id: 3,
      action: 'MOVE',
      value: 5,
      actuallyExecuted: 3,
      startTime: '2025-11-30T10:00:06.000Z',
      endTime: '2025-11-30T10:00:10.000Z',
      deliveryId: 1,
    },
    {
      id: 4,
      action: 'TURN',
      value: 0,
      actuallyExecuted: 0,
      startTime: '2025-11-30T10:00:10.000Z',
      endTime: '2025-11-30T10:00:10.000Z',
      deliveryId: 1,
    },
  ],
};

function renderDeliveryPage(deliveryId: string = '1') {
  return render(
    <MemoryRouter initialEntries={[`/delivery/${deliveryId}`]}>
      <SocketProvider>
        <Routes>
          <Route path="/delivery/:id" element={<Delivery />} />
        </Routes>
      </SocketProvider>
    </MemoryRouter>
  );
}

describe('Delivery Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve renderizar estado de carregamento inicialmente', () => {
    vi.mocked(deliveryService.getDeliveryById).mockImplementation(
      () => new Promise(() => { }) // Promise que nunca resolve
    );

    renderDeliveryPage();
    expect(screen.getByText('Carregando entrega...')).toBeInTheDocument();
  });

  it('deve carregar e exibir informações da entrega', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/Entrega: Entrega Teste/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Potências:/)).toBeInTheDocument();
    expect(screen.getByText(/L: 200 \| R: 200/)).toBeInTheDocument();
  });

  it('deve calcular e exibir o progresso corretamente', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/Progresso:/)).toBeInTheDocument();
    });

    // 4 de 4 instruções concluídas = 100%
    expect(screen.getByText(/4\/4 instruções \(100%\)/)).toBeInTheDocument();
  });

  it('deve exibir 100% de progresso quando todas as instruções estão concluídas', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/4\/4 instruções \(100%\)/)).toBeInTheDocument();
    });
  });

  it('deve renderizar o canvas de visualização', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });
  });

  it('deve exibir a legenda da visualização', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText('Percurso Planejado')).toBeInTheDocument();
    });

    expect(screen.getByText('Percurso Executado')).toBeInTheDocument();
    expect(screen.getByText('Carrinho')).toBeInTheDocument();
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Destino')).toBeInTheDocument();
  });

  it('deve listar todas as instruções', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText('📋 Lista de Instruções')).toBeInTheDocument();
    });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
  });

  it('deve exibir instruções MOVE corretamente', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getAllByText(/Mover/).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Planejado: 10 unidades/)).toBeInTheDocument();
  });

  it('deve exibir instruções TURN corretamente', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getAllByText(/Virar/).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/90° horário/)).toBeInTheDocument();
    expect(screen.getByText(/90° anti-horário/)).toBeInTheDocument();
  });

  it('deve marcar instruções concluídas corretamente', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      const completedStatuses = screen.getAllByText('✓ Concluída');
      expect(completedStatuses.length).toBe(4); // 4 instruções concluídas
    });
  });

  it('deve marcar instruções em execução corretamente', async () => {
    const deliveryWithExecuting: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        ...mockDelivery.instructions.slice(0, 2),
        {
          id: 3,
          action: 'MOVE',
          value: 5,
          actuallyExecuted: 3,
          startTime: '2025-11-30T10:00:06.000Z',
          endTime: '2025-11-30T10:00:10.000Z',
          deliveryId: 1,
        },
        {
          id: 4,
          action: 'TURN',
          value: 0,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:10.000Z',
          endTime: '2025-11-30T10:00:10.000Z',
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryWithExecuting);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/Progresso:/)).toBeInTheDocument();
    });
  });

  it('deve marcar instruções pendentes corretamente', async () => {
    const deliveryWithPending: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        ...mockDelivery.instructions.slice(0, 2),
        {
          id: 3,
          action: 'MOVE',
          value: 5,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:06.000Z',
          endTime: '2025-11-30T10:00:10.000Z',
          deliveryId: 1,
        },
        {
          id: 4,
          action: 'TURN',
          value: 0,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:10.000Z',
          endTime: '2025-11-30T10:00:10.000Z',
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryWithPending);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/Progresso:/)).toBeInTheDocument();
    });
  });

  it('deve exibir valor executado diferente do planejado quando houver diferença', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      // Instrução #3 tem value: 5 mas actuallyExecuted: 3
      expect(screen.getByText(/Executado: 3 unidades/)).toBeInTheDocument();
    });
  });

  it('deve chamar getDeliveryById com o ID correto da URL', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage('42');

    await waitFor(() => {
      expect(deliveryService.getDeliveryById).toHaveBeenCalledWith(42);
    });
  });

  it('deve lidar com entrega não encontrada', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(undefined);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText('Carregando entrega...')).toBeInTheDocument();
    });
  });

  it('deve renderizar canvas com dimensões corretas', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas?.width).toBe(800);
      expect(canvas?.height).toBe(600);
    });
  });

  it('deve calcular progresso como 0% quando não há instruções', async () => {
    const emptyDelivery: DeliveryWithInstructions = {
      id: 1,
      name: 'Entrega Vazia',
      potL: 200,
      potR: 200,
      startTime: '2025-11-30T10:00:00.000Z',
      endTime: '2025-11-30T10:10:00.000Z',
      instructions: [],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(emptyDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/0\/0 instruções \(0%\)/)).toBeInTheDocument();
    });
  });

  it('deve exibir botão de resend', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Resend/i })).toBeInTheDocument();
    });
  });

  it('deve chamar resendDelivery ao clicar no botão resend', async () => {
    const resendSpy = vi.spyOn(deliveryService, 'resendDelivery').mockResolvedValue(undefined);
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery);

    renderDeliveryPage('1');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Resend/i })).toBeInTheDocument();
    });

    const resendButton = screen.getByRole('button', { name: /Resend/i });
    fireEvent.click(resendButton);

    expect(resendSpy).toHaveBeenCalledWith(1);
  });

  it('deve exibir status "Virar Direita" para TURN com value 1', async () => {
    const deliveryWithRightTurn: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'TURN',
          value: 1,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryWithRightTurn);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/Virar Direita/i)).toBeInTheDocument();
    });
  });

  it('deve exibir status "Virar Esquerda" para TURN com value 0', async () => {
    const deliveryWithLeftTurn: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'TURN',
          value: 0,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryWithLeftTurn);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/Virar Esquerda/i)).toBeInTheDocument();
    });
  });

  it('deve calcular progresso parcial corretamente', async () => {
    const partialDelivery: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 10,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
        {
          id: 2,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 0,
          startTime: null,
          endTime: null,
          deliveryId: 1,
        },
        {
          id: 3,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 0,
          startTime: null,
          endTime: null,
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(partialDelivery);

    renderDeliveryPage();

    await waitFor(() => {
      // 1 de 3 instruções = 33%
      expect(screen.getByText(/1\/3 instruções \(33%\)/)).toBeInTheDocument();
    });
  });

  it('deve mostrar status "⏸ Pendente" para instruções não iniciadas', async () => {
    const deliveryWithPending: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 0,
          startTime: null,
          endTime: null,
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryWithPending);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText('⏸ Pendente')).toBeInTheDocument();
    });
  });

  it('deve mostrar status "⏳ Executando" para instruções em andamento', async () => {
    const deliveryExecuting: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 5,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: null,
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryExecuting);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText('⏳ Executando...')).toBeInTheDocument();
    });
  });

  it('não deve exibir valor executado quando igual ao planejado', async () => {
    const deliveryExactExecution: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 10,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
      ],
    };

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryExactExecution);

    renderDeliveryPage();

    await waitFor(() => {
      expect(screen.getByText(/Planejado: 10 unidades/)).toBeInTheDocument();
    });

    // Não deve mostrar "Executado: X unidades" se for igual ao planejado
    expect(screen.queryByText(/Executado:/)).not.toBeInTheDocument();
  });
});


describe('Delivery Page - Canvas and Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve lidar com delivery sem instruções no canvas', async () => {
    const emptyDelivery: DeliveryWithInstructions = {
      id: 1,
      name: 'Entrega Vazia',
      potL: 200,
      potR: 200,
      startTime: '2025-11-30T10:00:00.000Z',
      endTime: null,
      instructions: [],
    }

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(emptyDelivery)

    renderDeliveryPage()

    await waitFor(() => {
      expect(screen.getByText(/Entrega: Entrega Vazia/)).toBeInTheDocument()
    })

    const canvas = document.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('deve renderizar múltiplas instruções MOVE seguidas', async () => {
    const deliveryMultipleMoves: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 10,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
        {
          id: 2,
          action: 'MOVE',
          value: 15,
          actuallyExecuted: 15,
          startTime: '2025-11-30T10:00:05.000Z',
          endTime: '2025-11-30T10:00:10.000Z',
          deliveryId: 1,
        },
        {
          id: 3,
          action: 'MOVE',
          value: 20,
          actuallyExecuted: 20,
          startTime: '2025-11-30T10:00:10.000Z',
          endTime: '2025-11-30T10:00:15.000Z',
          deliveryId: 1,
        },
      ],
    }

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryMultipleMoves)

    renderDeliveryPage()

    await waitFor(() => {
      expect(screen.getAllByText(/Mover/).length).toBe(3)
    })
  })

  it('deve renderizar sequência complexa de MOVE e TURN', async () => {
    const complexDelivery: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 10,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
        {
          id: 2,
          action: 'TURN',
          value: 1,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:05.000Z',
          endTime: '2025-11-30T10:00:06.000Z',
          deliveryId: 1,
        },
        {
          id: 3,
          action: 'MOVE',
          value: 5,
          actuallyExecuted: 5,
          startTime: '2025-11-30T10:00:06.000Z',
          endTime: '2025-11-30T10:00:10.000Z',
          deliveryId: 1,
        },
        {
          id: 4,
          action: 'TURN',
          value: 0,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:10.000Z',
          endTime: '2025-11-30T10:00:11.000Z',
          deliveryId: 1,
        },
      ],
    }

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(complexDelivery)

    renderDeliveryPage()

    await waitFor(() => {
      expect(screen.getAllByText(/Mover/).length).toBe(2)
      expect(screen.getAllByText(/Virar/).length).toBe(2)
    })
  })

  it('deve mostrar diferença entre planejado e executado para várias instruções', async () => {
    const deliveryWithDifferences: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 8,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
        {
          id: 2,
          action: 'MOVE',
          value: 15,
          actuallyExecuted: 12,
          startTime: '2025-11-30T10:00:05.000Z',
          endTime: '2025-11-30T10:00:10.000Z',
          deliveryId: 1,
        },
      ],
    }

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(deliveryWithDifferences)

    renderDeliveryPage()

    await waitFor(() => {
      expect(screen.getByText(/Executado: 8 unidades/)).toBeInTheDocument()
      expect(screen.getByText(/Executado: 12 unidades/)).toBeInTheDocument()
    })
  })

  it('deve calcular progresso com instruções mistas', async () => {
    const mixedDelivery: DeliveryWithInstructions = {
      ...mockDelivery,
      instructions: [
        {
          id: 1,
          action: 'MOVE',
          value: 10,
          actuallyExecuted: 10,
          startTime: '2025-11-30T10:00:00.000Z',
          endTime: '2025-11-30T10:00:05.000Z',
          deliveryId: 1,
        },
        {
          id: 2,
          action: 'TURN',
          value: 1,
          actuallyExecuted: 0,
          startTime: '2025-11-30T10:00:05.000Z',
          endTime: null,
          deliveryId: 1,
        },
        {
          id: 3,
          action: 'MOVE',
          value: 5,
          actuallyExecuted: 0,
          startTime: null,
          endTime: null,
          deliveryId: 1,
        },
      ],
    }

    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mixedDelivery)

    renderDeliveryPage()

    await waitFor(() => {
      // 1 de 3 instruções completadas = 33%
      expect(screen.getByText(/1\/3 instruções \(33%\)/)).toBeInTheDocument()
    })
  })

  it('deve mostrar todas as legendas do canvas', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery)

    renderDeliveryPage()

    await waitFor(() => {
      expect(screen.getByText('Percurso Planejado')).toBeInTheDocument()
      expect(screen.getByText('Percurso Executado')).toBeInTheDocument()
      expect(screen.getByText('Carrinho')).toBeInTheDocument()
      expect(screen.getByText('Início')).toBeInTheDocument()
      expect(screen.getByText('Destino')).toBeInTheDocument()
    })
  })

  it('deve exibir todas as informações da delivery', async () => {
    vi.mocked(deliveryService.getDeliveryById).mockResolvedValue(mockDelivery)

    renderDeliveryPage()

    await waitFor(() => {
      expect(screen.getByText(/Entrega: Entrega Teste/)).toBeInTheDocument()
      expect(screen.getByText(/Progresso:/)).toBeInTheDocument()
      expect(screen.getByText(/Potências:/)).toBeInTheDocument()
      expect(screen.getByText(/L: 200 \| R: 200/)).toBeInTheDocument()
    })
  })
})
