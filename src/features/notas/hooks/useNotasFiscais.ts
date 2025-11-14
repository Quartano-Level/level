'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { NotaFiscal, NotasParams, NotaStatusEnum } from '../types'
import axios, { CancelTokenSource } from 'axios'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'
import { getStatusParam, isValidNotasData } from '../utils/notasUtils'

interface SortConfig {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
}

const API_URL = 'https://level-nfse.app.n8n.cloud/webhook/nfs-pendentes';
const REPROCESS_API_URL = 'https://level-nfse.app.n8n.cloud/webhook/2549b8a5-a9e0-4855-a8c1-cbe6b9a2db4e/nfs-pendentes';
const ITEMS_PER_PAGE = 7;

export function useNotasFiscais(initialParams: NotasParams = {}) {
    const [notas, setNotas] = useState<NotaFiscal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialParams.page || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [counters, setCounters] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: null,
        direction: 'desc'
    });
    
    // Novos estados para filtro de data
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const [shouldClearDates, setShouldClearDates] = useState(false);
    
    const allNotasRef = useRef<NotaFiscal[]>([]);
    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasInitializedRef = useRef(false);
    
    const { getAuthToken } = useAuth();

    const fetchCounters = useCallback(async () => {
        try {
            const token = getAuthToken();
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };

            const response = await axios.get(`${API_URL}/counters`, { headers });
            const data = response.data;

            if (data && data.resumo_status) {
                const result = { 
                    TOTAL: Object.values((data?.resumo_status || {}) as Record<string, number>).reduce((sum: number, val: number) => sum + val, 0),
                    ...data.resumo_status
                };

                setCounters(result);
                return result;
            }

            setCounters({});
            return {};
        } catch (error) {
            setCounters({});
            return {};
        }
    }, [getAuthToken]);

    const fetchNotasFromAPI = useCallback(async (params: NotasParams) => {
        try {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Operação cancelada devido a nova requisição');
            }
            
            cancelTokenRef.current = axios.CancelToken.source();
            
            const token = getAuthToken();
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            let url = API_URL;
            
            if (params.status) {
                url = `${url}?status=${params.status}`;
            }
            
            if (params.fornecedor && params.fornecedor.trim() !== '') {
                url = `${url}${url.includes('?') ? '&' : '?'}cnpj_prestador=${encodeURIComponent(params.fornecedor.trim())}`;
            }
            
            if (params.sort) {
                url = `${url}${url.includes('?') ? '&' : '?'}sort=${params.sort}&order=${params.order || 'desc'}`;
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const response = await axios.get(url, { 
                headers,
                cancelToken: cancelTokenRef.current.token
            });
            
            const responseData = response.data;
            
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
            throw new Error('Falha ao buscar notas fiscais da API');
        }
    }, [getAuthToken]);

    const filterByDateRange = useCallback((notasData: NotaFiscal[], start: string, end: string) => {
        if (!start && !end) {
            return notasData;
        }

        return notasData.filter(nota => {
            if (!nota.emission_date) return false;
            
            const emissionDate = nota.emission_date.split('T')[0]; // Pega apenas YYYY-MM-DD
            
            if (start && end) {
                return emissionDate >= start && emissionDate <= end;
            } else if (start) {
                return emissionDate >= start;
            } else if (end) {
                return emissionDate <= end;
            }
            
            return true;
        });
    }, []);

    const paginateData = useCallback((data: NotaFiscal[], currentPage: number) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.slice(startIndex, endIndex);
    }, []);

    const filterNotas = useCallback(async (params: NotasParams) => {
        setLoading(true);
        setError(null);
        
        try {
            const notasData = await fetchNotasFromAPI(params);
            
            if (Array.isArray(notasData) && isValidNotasData(notasData)) {
                const filteredByDate = filterByDateRange(notasData, startDate, endDate);
                
                allNotasRef.current = filteredByDate;
                
                const totalPages = Math.ceil(filteredByDate.length / ITEMS_PER_PAGE);
                setTotalPages(totalPages || 1);
                
                const newPage = params.page || 1;
                const validPage = Math.min(Math.max(1, newPage), totalPages || 1);
                setPage(validPage);
                
                const paginatedData = paginateData(filteredByDate, validPage);
                setNotas(paginatedData);
            } else {
                allNotasRef.current = [];
                setNotas([]);
                setPage(1);
                setTotalPages(1);
            }
            
            await fetchCounters();
        } catch (err) {
            setError('Erro ao buscar notas fiscais');
            allNotasRef.current = [];
            setNotas([]);
        } finally {
            setTimeout(() => setLoading(false), 700);
        }
    }, [fetchNotasFromAPI, fetchCounters, paginateData, filterByDateRange, startDate, endDate]);

    const filterNotasRef = useRef(filterNotas);
    
    useEffect(() => {
        filterNotasRef.current = filterNotas;
    }, [filterNotas]);

    useEffect(() => {
        hasInitializedRef.current = false;
    }, [initialParams.limit, initialParams.status]);

    useEffect(() => {
        if (shouldClearDates) {
            filterNotas({
                status: getStatusParam(activeFilter),
                page: 1,
                fornecedor: searchTerm || undefined,
                limit: initialParams.limit || 7
            });
            setShouldClearDates(false); 
        }
    }, [shouldClearDates, filterNotas, activeFilter, searchTerm, initialParams.limit]);

    useEffect(() => {
        if (hasInitializedRef.current) return;
        
        filterNotasRef.current({
            status: initialParams.status,
            limit: initialParams.limit || 7
        });
        
        hasInitializedRef.current = true;
        
        return () => {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Componente desmontado');
            }
        };
    }, [initialParams.limit, initialParams.status]);
    
    const handleFilterChange = useCallback((filter: NotaStatusEnum | 'TOTAL') => {
        setActiveFilter(filter);
        
        filterNotas({
            status: filter === 'TOTAL' ? undefined : filter,
            page: 1,
            fornecedor: searchTerm || undefined,
            limit: initialParams.limit || 7
        });
    }, [filterNotas, searchTerm, initialParams.limit]);
    
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (term.trim() === '') {
            filterNotas({
                status: getStatusParam(activeFilter),
                page: 1,
                fornecedor: undefined,
                limit: initialParams.limit || 7
            });
            return;
        }

        debounceTimeoutRef.current = setTimeout(() => {
            filterNotas({
                status: getStatusParam(activeFilter),
                page: 1,
                fornecedor: term,
                limit: initialParams.limit || 7
            });
        }, 300);
    }, [filterNotas, activeFilter, initialParams.limit]);
    
    const handleStartDateChange = useCallback((date: string) => {
        setStartDate(date);
    }, []);

    const handleEndDateChange = useCallback((date: string) => {
        setEndDate(date);
    }, []);

    const handleApplyDateFilter = useCallback(() => {
        filterNotas({
            status: getStatusParam(activeFilter),
            page: 1,
            fornecedor: searchTerm || undefined,
            limit: initialParams.limit || 7
        });
    }, [filterNotas, activeFilter, searchTerm, initialParams.limit]);

    const handleClearDateFilter = useCallback(() => {
        setStartDate('');
        setEndDate('');
        setShouldClearDates(true); // ✅ Ativa a flag
    }, []);
    
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        const paginatedData = paginateData(allNotasRef.current, newPage);
        setNotas(paginatedData);
    }, [paginateData]);
    
    const handleSort = useCallback((field: keyof NotaFiscal) => {
        const direction = 
            sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        
        setSortConfig({ field, direction });
        
        const sortedData = [...allNotasRef.current].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;
            
            if (field.includes("_date") || field === 'created_at') {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
            }
            
            const sortDirection = direction === 'desc' ? -1 : 1;
            
            if (aValue < bValue) return -1 * sortDirection;
            if (aValue > bValue) return 1 * sortDirection;
            return 0;
        });
        
        allNotasRef.current = sortedData;
        const paginatedData = paginateData(sortedData, 1);
        setNotas(paginatedData);
        setPage(1);
    }, [sortConfig, paginateData]);
    
    const handleAccessPDF = useCallback(async (nota: NotaFiscal) => {
        try {
            const response = await axios.get(`https://vsmmzloplfbxdkohpxea.supabase.co/storage/v1/object/public/nf/files/${nota.qive_id}.pdf`, {
                responseType: 'blob',
                headers: {
                    "Content-Type": "application/pdf"
                }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nota-fiscal-${nota.qive_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Erro ao baixar o PDF da nota fiscal');
        }
    }, []);
    
    const handleCorrectNota = useCallback(async (
        nota: NotaFiscal, 
        motivo: string, 
        processo?: string, 
        observacoes?: string,
        configDocCod?: number,
        contaProjetoCod?: number,
        gcdDesNome?: string
    ) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            const body: Record<string, any> = { motivo };
            if (processo !== undefined && processo !== '') body.processo = processo;
            if (observacoes !== undefined) body.observacoes = observacoes;
            if (configDocCod !== undefined && configDocCod !== null) body.config_doc = configDocCod;
            if (contaProjetoCod !== undefined && contaProjetoCod !== null) body.conta_de_projeto = contaProjetoCod;
            if (gcdDesNome !== undefined && gcdDesNome !== null && gcdDesNome !== '') body.gcdDesNome = gcdDesNome;

            await axios.post(`${REPROCESS_API_URL}/${nota.numero}/retry`,
                body,
                { headers }
            );

            toast.success(`Nota fiscal ${nota.numero} enviada para reprocessamento.`);

            await filterNotas({
                status: getStatusParam(activeFilter),
                fornecedor: searchTerm || undefined,
            });

            return true;
        } catch (error) {
            console.error('Erro ao reprocessar nota:', error);
            toast.error(`Erro ao reprocessar a nota fiscal ${nota.numero}.`);
            return false;
        }
    }, [filterNotas, activeFilter, searchTerm]);

    return {
        notas,
        loading,
        error,
        page,
        totalPages,
        counters,
        searchTerm,
        activeFilter,
        sorting: sortConfig,
        startDate,
        endDate,
        filterNotas,
        handleFilterChange,
        handleSearch,
        handlePageChange,
        handleSort,
        handleAccessPDF,
        handleCorrectNota,
        handleStartDateChange,
        handleEndDateChange,
        handleApplyDateFilter,
        handleClearDateFilter,
        setLoading,
    }
}