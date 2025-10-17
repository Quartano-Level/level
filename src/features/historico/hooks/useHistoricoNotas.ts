'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { HistoricoNota, HistoricoParams, SortConfig } from '../types';
import {
  fetchHistoricoNotas,
  filterNotasBySearchTerm,
  sortNotas,
  paginateNotas,
} from '../services/historicoService';

const ITEMS_PER_PAGE = 9;

export interface UseHistoricoNotasReturn {
  notas: HistoricoNota[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalItems: number;
  searchTerm: string;
  sortConfig: SortConfig;
  handleSearch: (term: string) => void;
  handleSort: (field: keyof HistoricoNota) => void;
  handlePageChange: (page: number) => void;
  reload: () => void;
}

export function useHistoricoNotas(
  initialParams: HistoricoParams = {}
): UseHistoricoNotasReturn {
  const [allNotas, setAllNotas] = useState<HistoricoNota[]>([]);
  const [notas, setNotas] = useState<HistoricoNota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialParams.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialParams.searchTerm || '');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: 'desc',
  });

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoadRef = useRef(true);

  const processData = useCallback(
    (
      data: HistoricoNota[],
      search: string,
      sort: SortConfig,
      currentPage: number
    ) => {
      let processed = filterNotasBySearchTerm(data, search);

      if (sort.field) {
        processed = sortNotas(processed, sort.field, sort.direction);
      } else {
        processed = sortNotas(processed, 'created_at', 'desc');
      }

      const total = processed.length;
      const pages = Math.ceil(total / ITEMS_PER_PAGE);
      const validPage = currentPage > pages && pages > 0 ? 1 : currentPage;
      const paginated = paginateNotas(processed, validPage, ITEMS_PER_PAGE);

      return {
        items: paginated.items,
        totalPages: paginated.totalPages,
        totalItems: paginated.totalItems,
        currentPage: validPage,
      };
    },
    []
  );

  const updateDisplayData = useCallback(() => {
    const result = processData(allNotas, searchTerm, sortConfig, page);
    
    setNotas(result.items);
    setTotalPages(result.totalPages);
    setTotalItems(result.totalItems);
    
    if (result.currentPage !== page) {
      setPage(result.currentPage);
    }
  }, [allNotas, searchTerm, sortConfig, page, processData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Buscando dados do histórico...');
      
      const data = await fetchHistoricoNotas();
      
      console.log(`✅ ${data.length} notas carregadas com sucesso`);
      
      setAllNotas(data);
      
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar histórico';
      console.error('❌ Erro ao buscar histórico:', errorMessage);
      setError(errorMessage);
      setAllNotas([]);
    } finally {
      setLoading(false);
      isFirstLoadRef.current = false;
    }
  }, []);

  const handleSearch = useCallback((term: string) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      console.log('🔍 Aplicando busca:', term);
      setSearchTerm(term);
      setPage(1);
    }, 300);
  }, []);

  const handleSort = useCallback((field: keyof HistoricoNota) => {
    setSortConfig((prev) => {
      const newDirection =
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc';
      
      console.log(`🔽 Ordenando por ${field} (${newDirection})`);
      
      return {
        field,
        direction: newDirection,
      };
    });
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log(`📄 Navegando para página ${newPage}`);
      setPage(newPage);
    }
  }, [totalPages]);

  const reload = useCallback(() => {
    console.log('🔄 Recarregando dados...');
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [fetchData]);

  useEffect(() => {
    if (!isFirstLoadRef.current && allNotas.length > 0) {
      updateDisplayData();
    }
  }, [allNotas, searchTerm, sortConfig, page, updateDisplayData]);

  useEffect(() => {
    if (!isFirstLoadRef.current && allNotas.length > 0) {
      const result = processData(allNotas, searchTerm, sortConfig, page);
      setNotas(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    }
  }, [allNotas, searchTerm, sortConfig, page, processData]);

  return {
    notas,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    searchTerm,
    sortConfig,
    handleSearch,
    handleSort,
    handlePageChange,
    reload,
  };
}