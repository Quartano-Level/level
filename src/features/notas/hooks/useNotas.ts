import { useRef } from "react";
import { NotasParams } from "../types";
import { NotasTableRef } from "../components/NotasTable";
import { useNotasFiscais } from "./useNotasFiscais";

// Número fixo de itens por página
const FIXED_ITEMS_PER_PAGE = 7;

/**
 * Hook para gerenciar o estado e lógica de notas fiscais
 * Wrapper simples para o hook useNotasFiscais
 */
export function useNotas(initialParams: NotasParams = {}) {
  // Referência para a tabela
  const tableRef = useRef<NotasTableRef | null>(null);
  
  // Usar o hook especializado para notas fiscais
  const notasFiscais = useNotasFiscais({
    ...initialParams,
    limit: FIXED_ITEMS_PER_PAGE
  });
  
  return {
    ...notasFiscais,
    tableRef
  };
} 