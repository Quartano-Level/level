'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { NotaFiscal, NotasParams, NotaStatusEnum } from '../types'
import axios, { CancelTokenSource } from 'axios'
import { useAuth } from '@/features/auth/hooks/useAuth'

// Interface SortConfig interna
interface SortConfig {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
}

// URL base da API
const API_URL = 'https://level-nfse.app.n8n.cloud/webhook/nfs-pendentes';
const API_URL_HISTORICO = "https://level-nfse.app.n8n.cloud/webhook/nfs-pendentes/historico"

// Número fixo de itens por página
const ITEMS_PER_PAGE = 9;

/**
 * Hook especializado para gerenciar o histórico de notas fiscais
 * USANDO A MESMA ESTRATÉGIA DO useNotasFiscais (paginação local)
 */
export function useHistoricoNotas(initialParams: NotasParams = {}) {
    // Estados básicos
    const [notas, setNotas] = useState<NotaFiscal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialParams.page || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: null,
        direction: 'desc'
    });
    
    // *** IGUAL AO useNotasFiscais: Dados completos para paginação local ***
    const allNotasRef = useRef<NotaFiscal[]>([]);
    
    // Referência para o token de cancelamento da última requisição
    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Obter o token de autenticação e estado de carregamento da sessão
    const { getAuthToken, loading: authLoading } = useAuth();

    // Função para validar dados das notas (mesma do useNotasFiscais)
    const isValidNotasData = (data: any[]): data is NotaFiscal[] => {
        return Array.isArray(data) && data.length > 0 && 
               typeof data[0] === 'object' && 
               Object.keys(data[0]).length > 0;
    };

    // *** CORRIGIDO: Função para buscar notas da API (SEM paginação via API) ***
    const fetchNotasFromAPI = useCallback(async (params: NotasParams) => {
        try {
            // Cancelar requisição anterior se existir
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Operação cancelada devido a nova requisição');
            }
            
            cancelTokenRef.current = axios.CancelToken.source();
            
            const token = getAuthToken();
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            // *** CORREÇÃO: Buscar TODOS os dados sem limit/offset (como useNotasFiscais) ***
            let url = API_URL_HISTORICO;
            
            // Adicionar ordenação se existir
            if (params.sort) {
                url = `${url}&sort=${params.sort}&order=${params.order || 'desc'}`;
            }
            
            // *** REMOVIDO: parâmetros limit, offset e cnpj_prestador da URL ***
            // A filtragem será feita localmente no frontend
            
            console.log('🚀 URL da requisição (SEM filtros):', url);
            
            // Delay para debounce
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const response = await axios.get(url, { 
                headers,
                cancelToken: cancelTokenRef.current.token
            });
            
            const responseData = response.data;
            console.log('📦 Resposta da API (todos os dados):', responseData);
            
            // Processar resposta (igual ao useNotasFiscais)
            if (Array.isArray(responseData)) {
                return isValidNotasData(responseData) ? responseData : [];
            }
            
            if (responseData.notas && Array.isArray(responseData.notas)) {
                return isValidNotasData(responseData.notas) ? responseData.notas : [];
            }
            
            return [];
        } catch (error) {
            if (axios.isCancel(error)) {
                return [];
            }
            console.error('Erro ao buscar notas fiscais:', error);
            throw new Error('Falha ao buscar notas fiscais da API');
        }
    }, [getAuthToken]);

    // *** ADICIONADO: Função para aplicar paginação nos dados (igual useNotasFiscais) ***
    const paginateData = useCallback((data: NotaFiscal[], currentPage: number) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.slice(startIndex, endIndex);
    }, []);

    // *** ADICIONADO: Função para filtrar dados localmente ***
    const filterDataLocally = useCallback((data: NotaFiscal[], searchTerm: string) => {
        if (!searchTerm.trim()) {
            return data;
        }
        
        const term = searchTerm.toLowerCase().trim();
        return data.filter(nota => {
            // Filtrar por CNPJ do prestador (fornecedor)
            const cnpj = nota.filCnpj?.toLowerCase() || '';
            
            return cnpj.includes(term);
        });
    }, []);

    // *** CORRIGIDO: Função principal usando estratégia do useNotasFiscais ***
    const filterNotas = useCallback(async (params: NotasParams) => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('🔍 Parâmetros de busca:', params);
            
            const notasData = await fetchNotasFromAPI(params);
            
            if (Array.isArray(notasData) && isValidNotasData(notasData)) {
                // *** FILTRAR DADOS LOCALMENTE ***
                const filteredData = filterDataLocally(notasData, params.fornecedor || '');
                console.log('📋 Dados filtrados localmente:', filteredData.length, 'de', notasData.length);
                
                // Guardar todos os dados filtrados (igual useNotasFiscais)
                allNotasRef.current = filteredData;
                
                // Calcular total de páginas
                const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
                setTotalPages(totalPages || 1);
                
                // Definir página atual
                const newPage = params.page || 1;
                const validPage = Math.min(Math.max(1, newPage), totalPages || 1);
                setPage(validPage);
                
                // Aplicar paginação
                const paginatedData = paginateData(filteredData, validPage);
                setNotas(paginatedData);
            } else {
                // Dados vazios
                allNotasRef.current = [];
                setNotas([]);
                setPage(1);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Erro ao buscar notas fiscais:', err);
            setError('Erro ao buscar notas fiscais');
            allNotasRef.current = [];
            setNotas([]);
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    }, [fetchNotasFromAPI, paginateData, filterDataLocally]);

    // Efeito para carregar as notas iniciais após a autenticação estar pronta
    useEffect(() => {
        if (authLoading) return; // aguardar sessão pronta

        filterNotas({
            status: NotaStatusEnum.COMPLETA,
            limit: initialParams.limit || 9
        });

        return () => {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Componente desmontado');
            }
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [authLoading, filterNotas, initialParams.limit]);

    // *** CORRIGIDO: handleSearch igual ao useNotasFiscais ***
    const handleSearch = useCallback((term: string) => {
        console.log('🔎 Termo de busca recebido:', term);
        
        // Atualizar o estado imediatamente
        setSearchTerm(term);

        // Limpar timeout anterior
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Se o campo estiver vazio, executar imediatamente
        if (term.trim() === '') {
            console.log('🧹 Campo vazio, buscando todas as notas');
            filterNotas({
                status: NotaStatusEnum.COMPLETA,
                page: 1,
                fornecedor: undefined,
                limit: initialParams.limit || 9
            });
            return;
        }

        // Para termos não vazios, aplicar debounce
        debounceTimeoutRef.current = setTimeout(() => {
            console.log('⏰ Executando busca com debounce para:', term);
            filterNotas({
                status: NotaStatusEnum.COMPLETA,
                page: 1,
                fornecedor: term,
                limit: initialParams.limit || 9
            });
        }, 300);
    }, [filterNotas, initialParams.limit]);
    
    // *** CORRIGIDO: Mudança de página usando paginação local (igual useNotasFiscais) ***
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        const paginatedData = paginateData(allNotasRef.current, newPage);
        setNotas(paginatedData);
    }, [paginateData]);
    
    // *** CORRIGIDO: Ordenação usando estratégia mista (igual useNotasFiscais) ***
    const handleSort = useCallback((field: keyof NotaFiscal) => {
        const direction = 
            sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        
        setSortConfig({ field, direction });
        
        // Tentar ordenação via API primeiro (se houver termo de busca)
        if (searchTerm) {
            filterNotas({
                status: NotaStatusEnum.COMPLETA,
                sort: field as string,
                order: direction,
                page: 1,
                fornecedor: searchTerm || undefined,
                limit: initialParams.limit || 9
            });
            return;
        }
        
        // Ordenação local (mais rápida para dados já carregados)
        const sortedData = [...allNotasRef.current].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            // Tratar valores nulos/undefined
            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;
            
            // Tratar datas como strings ISO
            if (field === 'emission_date' || field === 'created_at' || field === 'updated_qive_date') {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
            }
            
            const sortDirection = direction === 'desc' ? -1 : 1;
            
            if (aValue < bValue) return -1 * sortDirection;
            if (aValue > bValue) return 1 * sortDirection;
            return 0;
        });
        
        // Atualizar dados completos ordenados
        allNotasRef.current = sortedData;
        
        // Aplicar paginação nos dados ordenados
        const paginatedData = paginateData(sortedData, 1);
        setNotas(paginatedData);
        setPage(1);
    }, [sortConfig, searchTerm, filterNotas, initialParams.limit, paginateData]);
    
    // Função para obter o PDF de uma nota
    const getNotaPDF = useCallback(async (nota: NotaFiscal) => {
        try {
            const token = getAuthToken();
            
            const response = await axios.get(`https://vsmmzloplfbxdkohpxea.supabase.co/storage/v1/object/public/nf/files/${nota.qive_id}.pdf`, {
                responseType: 'blob',
                headers: {
                    "Content-Type": "application/pdf",
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });
            
            // Criar URL para download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nota-fiscal-${nota.qive_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar o PDF da nota fiscal');
        }
    }, [getAuthToken]);
    
    // Função para obter o XML de uma nota
    const getNotaXML = useCallback(async (id: string) => {
        try {
            const token = getAuthToken();
            
            const response = await axios.get(`${API_URL}/xml/${id}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });
            
            // Criar URL para download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nota-fiscal-${id}.xml`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar XML:', error);
            alert('Erro ao baixar o XML da nota fiscal');
        }
    }, [getAuthToken]);
    
    return {
        notas,
        loading,
        error,
        page,
        totalPages,
        searchTerm,
        sorting: sortConfig,
        fetchNotas: filterNotas,
        handleSearch,
        handlePageChange,
        handleSort,
        getNotaPDF,
        getNotaXML,
        setLoading,
    };
}