import { renderHook, act } from '@testing-library/react';
import { useNotas } from '../hooks/useNotas';
import { notasService } from '../services/notasService';
import { toast } from 'sonner';
import { NotaFiscal } from '../types';

// Mock das dependências
jest.mock('../services/notasService');
jest.mock('sonner');

// Mock de dados para testes
const mockNotas: NotaFiscal[] = [
  {
    id: '1',
    dataEmissao: '03/03/2025',
    fornecedor: 'Empresa LTDA',
    numero: 'NF-e nº 123456789',
    valor: 'R$ 3.293,29',
    status: 'pendente',
    motivo: 'Api fora do ar'
  },
  {
    id: '2',
    dataEmissao: '02/03/2025',
    fornecedor: 'Distribuidora XYZ',
    numero: 'NF-e nº 987654321',
    valor: 'R$ 1.567,80',
    status: 'em_processamento',
    motivo: '-'
  }
];

const mockCounters = {
  pendentes: 10,
  emProcessamento: 5
};

describe('useNotas Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup dos mocks
    jest.spyOn(notasService, 'getNotas').mockResolvedValue({
      data: mockNotas,
      total: mockNotas.length,
      page: 1,
      limit: 10,
      totalPages: 1
    });
    
    jest.spyOn(notasService, 'getDashboardCounters').mockResolvedValue(mockCounters);
    jest.spyOn(notasService, 'getNotaPDF').mockResolvedValue({ url: 'https://exemplo.com/pdf' });
    jest.spyOn(notasService, 'corrigirNota').mockResolvedValue(true);
  });
  
  test('deve carregar notas e contadores ao inicializar', async () => {
    const { result } = renderHook(() => useNotas());
    
    // Aguardar resolução das promises
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(notasService.getNotas).toHaveBeenCalled();
    expect(notasService.getDashboardCounters).toHaveBeenCalled();
    expect(result.current.notas).toEqual(mockNotas);
    expect(result.current.counters).toEqual(mockCounters);
  });
  
  test('handleFilterChange deve aplicar filtro corretamente', async () => {
    const { result } = renderHook(() => useNotas());
    
    // Aguardar resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Aplicar filtro
    await act(async () => {
      result.current.handleFilterChange('pendente');
    });
    
    expect(notasService.getNotas).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pendente',
        page: 1
      })
    );
    expect(result.current.activeFilter).toBe('pendente');
  });
  
  test('handleSearch deve realizar busca corretamente', async () => {
    const { result } = renderHook(() => useNotas());
    
    // Aguardar resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Realizar busca
    await act(async () => {
      result.current.handleSearch({ target: { value: 'Empresa' } } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(notasService.getNotas).toHaveBeenCalledWith(
      expect.objectContaining({
        fornecedor: 'Empresa',
        page: 1
      })
    );
    expect(result.current.searchTerm).toBe('Empresa');
  });
  
  test('handleAccessPDF deve acessar PDF corretamente', async () => {
    const { result } = renderHook(() => useNotas());
    
    // Aguardar resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Acessar PDF
    await act(async () => {
      await result.current.handleAccessPDF(mockNotas[0]);
    });
    
    expect(notasService.getNotaPDF).toHaveBeenCalledWith(mockNotas[0].id);
    expect(toast.success).toHaveBeenCalled();
  });
  
  test('handleCorrectNota deve corrigir nota corretamente', async () => {
    const { result } = renderHook(() => useNotas());
    
    // Aguardar resolução das promises iniciais
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Corrigir nota
    await act(async () => {
      const success = await result.current.handleCorrectNota(mockNotas[0], 'Correção de teste');
      expect(success).toBe(true);
    });
    
    expect(notasService.corrigirNota).toHaveBeenCalledWith(mockNotas[0].id, 'Correção de teste');
    expect(toast.success).toHaveBeenCalled();
    expect(notasService.getNotas).toHaveBeenCalled();
  });
  
  test('deve lidar com erros corretamente', async () => {
    // Mock de erro
    jest.spyOn(notasService, 'getNotas').mockRejectedValueOnce(new Error('Erro de teste'));
    
    const { result } = renderHook(() => useNotas());
    
    // Aguardar resolução das promises
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(toast.error).toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(Error);
  });
}); 