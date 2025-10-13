import { useState, useCallback } from "react";
import { useHistoricoNotas } from "./useHistoricoNotas";
import { NotaStatusEnum } from "../types";

/**
 * Hook para gerenciar o estado da página de histórico de notas fiscais
 * Centraliza a lógica de busca e gerenciamento de estado
 */
export function useHistoricoPageState() {
    // Estado para termo de busca
    const [inputSearchTerm, setInputSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    
    // Consumir o hook de histórico
    const {
        handleSearch: hookHandleSearch,
        fetchNotas,
        loading,
        error,
        ...historicoData
    } = useHistoricoNotas({
        limit: 8 // 8 itens por página para o histórico
    });
    
    // Função para lidar com a pesquisa no input com debounce
    const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setInputSearchTerm(term);
        
        // Indicar que estamos pesquisando
        setIsSearching(true);
        
        // Implementar um debounce simples para evitar muitas chamadas
        const debounceTimer = setTimeout(() => {
            hookHandleSearch(term);
            setIsSearching(false);
        }, 300);
        
        return () => clearTimeout(debounceTimer);
    }, [hookHandleSearch]);
    
    // Função para recarregar os dados
    const refreshData = useCallback(() => {
        fetchNotas({
            limit: 8,
            status: NotaStatusEnum.PENDENTE,
            fornecedor: inputSearchTerm.trim() ? inputSearchTerm : undefined
        });
    }, [fetchNotas, inputSearchTerm]);
    
    return {
        inputSearchTerm,
        handleSearch: handleSearchInput,
        fetchNotas,
        loading: loading || isSearching,
        error,
        refreshData,
        ...historicoData
    };
} 