
import { HistoricoNota } from '../types';

/**
 * URL base da API de histórico
 */
const HISTORICO_API_URL = 'https://level-nfse.app.n8n.cloud/webhook/nfs-pendentes/historico';

/**
 * Busca todas as notas fiscais do histórico
 * @returns Promise com array de notas fiscais
 * @throws Error se a requisição falhar
 */
export async function fetchHistoricoNotas(): Promise<HistoricoNota[]> {
  try {
    const response = await fetch(HISTORICO_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar histórico: ${response.status} ${response.statusText}`);
    }

    const data: HistoricoNota[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar histórico de notas:', error);
    throw error;
  }
}

/**
 * Filtra notas por termo de busca
 * Busca em: numero, counterparty_cnpj, obs, filCnpj
 * @param notas - Array de notas para filtrar
 * @param searchTerm - Termo de busca
 * @returns Array filtrado
 */
export function filterNotasBySearchTerm(
  notas: HistoricoNota[],
  searchTerm: string
): HistoricoNota[] {
  if (!searchTerm.trim()) {
    return notas;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return notas.filter(nota => {
    return (
      nota.numero.toString().includes(term) ||
      nota.counterparty_cnpj.toLowerCase().includes(term) ||
      nota.filCnpj.toLowerCase().includes(term) ||
      (nota.obs && nota.obs.toLowerCase().includes(term))
    );
  });
}

/**
 * Ordena notas por campo específico
 * @param notas - Array de notas para ordenar
 * @param field - Campo para ordenação
 * @param direction - Direção da ordenação
 * @returns Array ordenado
 */
export function sortNotas(
  notas: HistoricoNota[],
  field: keyof HistoricoNota,
  direction: 'asc' | 'desc'
): HistoricoNota[] {
  return [...notas].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    // Tratamento para valores null/undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Comparação numérica
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Comparação de strings (inclui datas em formato ISO)
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (direction === 'asc') {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });
}

/**
 * Pagina um array de notas
 * @param notas - Array completo de notas
 * @param page - Número da página (1-indexed)
 * @param pageSize - Tamanho da página
 * @returns Objeto com dados paginados
 */
export function paginateNotas(
  notas: HistoricoNota[],
  page: number,
  pageSize: number
) {
  const totalItems = notas.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = notas.slice(startIndex, endIndex);

  return {
    items,
    totalItems,
    totalPages,
    currentPage: page,
    pageSize,
  };
}