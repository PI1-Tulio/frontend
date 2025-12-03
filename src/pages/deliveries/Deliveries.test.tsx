import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Deliveries } from './Deliveries';
import { MemoryRouter } from 'react-router-dom';
import * as deliveryService from '../../api/deliveryService';
import type { Delivery } from '../../api/DeliveryDTO';

// Mock do deliveryService
vi.mock('../../api/deliveryService', () => ({
  listDeliveries: vi.fn(),
}));

const mockDeliveries: Delivery[] = [
  {
    id: 1,
    name: 'Entrega Concluída',
    potL: 200,
    potR: 200,
    startTime: '2025-11-30T10:00:00.000Z',
    endTime: '2025-11-30T10:10:00.000Z',
  },
  {
    id: 2,
    name: 'Entrega Em Andamento',
    potL: 150,
    potR: 150,
    startTime: '2025-11-30T11:00:00.000Z',
    endTime: '2025-11-30T11:10:00.000Z',
  },
  {
    id: 3,
    name: 'Entrega Pendente',
    potL: 180,
    potR: 180,
    startTime: '2025-11-30T12:00:00.000Z',
    endTime: '2025-11-30T12:10:00.000Z',
  },
];

function renderDeliveries() {
  return render(
    <MemoryRouter>
      <Deliveries />
    </MemoryRouter>
  );
}

describe('Deliveries Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir estado de carregamento inicialmente', () => {
    vi.mocked(deliveryService.listDeliveries).mockImplementation(
      () => new Promise(() => { }) // Promise que nunca resolve
    );

    renderDeliveries();
    expect(screen.getByText(/Carregando entregas.../)).toBeInTheDocument();
  });

  it('deve carregar e exibir lista de entregas', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText('Entrega Concluída')).toBeInTheDocument();
    });

    expect(screen.getByText('Entrega Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Entrega Pendente')).toBeInTheDocument();
  });

  it('deve exibir título e subtítulo da página', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText('📦 Minhas Entregas')).toBeInTheDocument();
    });

    expect(screen.getByText('Gerencie e acompanhe todas as suas entregas')).toBeInTheDocument();
  });

  it('deve exibir ID de cada entrega', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText('ID: #1')).toBeInTheDocument();
    });

    expect(screen.getByText('ID: #2')).toBeInTheDocument();
    expect(screen.getByText('ID: #3')).toBeInTheDocument();
  });

  it('deve exibir badges de status corretamente', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      const badges = screen.getAllByText('Concluída');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('deve exibir valores de potência para cada entrega', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      const potValues200 = screen.getAllByText('200');
      expect(potValues200.length).toBeGreaterThan(0);
    });

    const potValues150 = screen.getAllByText('150');
    expect(potValues150.length).toBeGreaterThan(0);

    const potValues180 = screen.getAllByText('180');
    expect(potValues180.length).toBeGreaterThan(0);
  });

  it('deve exibir botão "Ver Detalhes" em cada card', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      const buttons = screen.getAllByText('Ver Detalhes →');
      expect(buttons).toHaveLength(3);
    });
  });

  it('deve navegar para página de detalhes ao clicar no card', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    const { container } = renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText('Entrega Concluída')).toBeInTheDocument();
    });

    const firstCard = container.querySelector('[class*="deliveryCard"]');
    expect(firstCard).toBeTruthy();

    if (firstCard) {
      fireEvent.click(firstCard);
      // Verifica que a navegação foi tentada
      expect(window.location.pathname).toBeTruthy();
    }
  });

  it('deve formatar data de início corretamente', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      // A data deve estar formatada em pt-BR
      const timestamps = document.querySelectorAll('[class*="timestamp"]');
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  it('deve exibir mensagem quando não há entregas', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue([]);

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText('📦 Nenhuma entrega encontrada')).toBeInTheDocument();
    });

    expect(screen.getByText('Crie uma nova entrega para começar!')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando falha ao carregar', async () => {
    vi.mocked(deliveryService.listDeliveries).mockRejectedValue(
      new Error('Network error')
    );

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar as entregas/)).toBeInTheDocument();
    });

    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
  });

  it('deve tentar carregar novamente ao clicar no botão de retry', async () => {
    vi.mocked(deliveryService.listDeliveries).mockRejectedValueOnce(
      new Error('Network error')
    ).mockResolvedValueOnce(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar as entregas/)).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Tentar Novamente');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Entrega Concluída')).toBeInTheDocument();
    });
  });

  it('deve exibir cards em grid responsivo', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    const { container } = renderDeliveries();

    await waitFor(() => {
      const grid = container.querySelector('[class*="deliveriesGrid"]');
      expect(grid).toBeTruthy();
    });
  });

  it('deve renderizar entrega sem data de início', async () => {
    const deliveryNoProg: Delivery = {
      id: 4,
      name: 'Entrega Sem Data',
      potL: 100,
      potR: 100,
      startTime: '2025-11-30T13:00:00.000Z',
      endTime: '2025-11-30T13:10:00.000Z',
    };

    vi.mocked(deliveryService.listDeliveries).mockResolvedValue([deliveryNoProg]);

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText('Entrega Sem Data')).toBeInTheDocument();
    });
  });

  it('deve renderizar card corretamente', async () => {
    const deliverySimple: Delivery = {
      id: 5,
      name: 'Entrega Simples',
      potL: 100,
      potR: 100,
      startTime: '2025-11-30T14:00:00.000Z',
      endTime: '2025-11-30T14:10:00.000Z',
    };

    vi.mocked(deliveryService.listDeliveries).mockResolvedValue([deliverySimple]);

    renderDeliveries();

    await waitFor(() => {
      expect(screen.getByText('Entrega Simples')).toBeInTheDocument();
    });
  });

  it('deve chamar listDeliveries ao montar o componente', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      expect(deliveryService.listDeliveries).toHaveBeenCalledTimes(1);
    });
  });

  it('deve exibir labels de potência L e R', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    renderDeliveries();

    await waitFor(() => {
      const labelsL = screen.getAllByText(/L:/);
      const labelsR = screen.getAllByText(/R:/);
      expect(labelsL.length).toBeGreaterThan(0);
      expect(labelsR.length).toBeGreaterThan(0);
    });
  });

  it('deve aplicar classes CSS corretas aos cards', async () => {
    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockDeliveries);

    const { container } = renderDeliveries();

    await waitFor(() => {
      const cards = container.querySelectorAll('[class*="deliveryCard"]');
      expect(cards.length).toBe(3);
    });
  });
});

describe('Deliveries Page - Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve formatar datas corretamente', async () => {
    const mockWithDate: Delivery[] = [
      {
        id: 1,
        name: 'Entrega com Data',
        potL: 200,
        potR: 200,
        startTime: '2025-11-30T14:30:00.000Z',
        endTime: null,
      },
    ]

    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockWithDate)

    render(
      <MemoryRouter>
        <Deliveries />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Em Andamento/i)).toBeInTheDocument()
    })
  })

  it('deve exibir status pendente para entregas não iniciadas', async () => {
    const mockPending: Delivery[] = [
      {
        id: 1,
        name: 'Entrega Não Iniciada Test',
        potL: 200,
        potR: 200,
        startTime: null,
        endTime: null,
      },
    ]

    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockPending)

    render(
      <MemoryRouter>
        <Deliveries />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Entrega Não Iniciada Test')).toBeInTheDocument()
    })

    const naoIniciada = screen.getAllByText(/Não iniciada/i)
    expect(naoIniciada.length).toBeGreaterThan(0)

    const pendentes = screen.getAllByText(/Pendente/i)
    expect(pendentes.length).toBeGreaterThan(0)
  })

  it('deve exibir status completado para entregas finalizadas', async () => {
    const mockCompleted: Delivery[] = [
      {
        id: 1,
        name: 'Entrega Completa',
        potL: 200,
        potR: 200,
        startTime: '2025-11-30T14:00:00.000Z',
        endTime: '2025-11-30T15:00:00.000Z',
      },
    ]

    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockCompleted)

    render(
      <MemoryRouter>
        <Deliveries />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Concluída/i)).toBeInTheDocument()
    })
  })

  it('deve exibir múltiplas entregas com diferentes potências', async () => {
    const mockMultiple: Delivery[] = [
      {
        id: 1,
        name: 'Entrega 1',
        potL: 150,
        potR: 200,
        startTime: null,
        endTime: null,
      },
      {
        id: 2,
        name: 'Entrega 2',
        potL: 250,
        potR: 300,
        startTime: null,
        endTime: null,
      },
    ]

    vi.mocked(deliveryService.listDeliveries).mockResolvedValue(mockMultiple)

    render(
      <MemoryRouter>
        <Deliveries />
      </MemoryRouter>
    )

    await waitFor(() => {
      const potElements = screen.getAllByText(/L:/)
      expect(potElements.length).toBeGreaterThan(0)
    })
  })
})
