import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

/**
 * Representa uma nota fiscal no sistema
 */
export interface NotaFiscal {
    qive_id: string;
    numero: number;
    created_at?: string;
    status: NotaStatusEnum;
    updated_qive_date?: Timestamp;
    escriturada_date?: Timestamp;
    saved_date?: Timestamp;
    completed_date?: Timestamp;
    info: string;
    attempts: number;
    id_metrica?: string;
    emission_date?: string;
    identified_date?: Timestamp;
    error_date?: Timestamp;
    processing_started_date?: Timestamp;
    obs?: string;
    counterparty_cnpj: string;
    filcod?: number;
    filCnpj?: string;
    total_value?: number;
}

/**
 * Parâmetros para busca de notas fiscais
 */
export interface NotasParams {
    page?: number;
    limit?: number;
    status?: NotaStatusEnum;
    fornecedor?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Configuração de ordenação
 */
export interface SortConfig {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
}

/**
 * Ação de uma nota fiscal
 */
export interface NotaActionConfig {
    label: string;
    onClick: (nota: NotaFiscal) => void;
    className?: string;
}

/**
 * Enum para os status possíveis de uma nota fiscal
 */
export enum NotaStatusEnum {
    PENDENTE = 'PENDING',
    EM_PROCESSAMENTO = 'PROCESSING',
    IDENTIFIED = 'IDENTIFIED',
    SAVED = 'SAVED',
    ESCRITURADA = 'ESCRITURADA',
    COMPLETA = 'FINALIZADA',
}

/**
 * Nova estrutura da resposta da API de configuração de documento e conta de projeto
 */
export interface ContaProjeto {
    filCod: number;
    gcdCod: number;
    prjCod: number;
    prjDesNome: string;
    ctpCod: number;
    ctpDesNome: string;
    [key: string]: any;
}

export interface ConfigDocumento {
    gcdCod: number;
    gcdDesNome: string;
    contas_de_projeto: ContaProjeto[];
}

export type ConfigDocContaProjetoResponse = ConfigDocumento[];