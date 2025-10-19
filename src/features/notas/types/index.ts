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
    emission_date?: String;
    identified_date?: Timestamp;
    error_date?: Timestamp;
    processing_started_date?: Timestamp;
    obs?: string;
    counterparty_cnpj: string;
    filcod?: number;
    filCnpj?: string;
    valor_nota?: number;

    // cnpj_prestador: string;
    // data_emissao: string;
    // valor_total: number;
    // item_lista_serv?: string;
    // discriminacao?: string;
    // pricod?: string;
    
    // /** Compatibilidade: algumas respostas trazem um único campo de motivo */
    // motivos_pendencia?: string;
    // attempt_count?: number;
    // next_retry?: string | null;
    // is_reprocessing?: boolean;
    // xml_path?: string;
    // pdf_path?: string;
    // xml_hash?: string;
    // pdf_hash?: string;
    
    // updated_at?: string;
    // qive_id?: string;
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
    EM_PROCESSAMENTO = 'em_processamento',
    IDENTIFIED = 'identificada',
    SAVED = 'SAVED',
    ESCRITURADA = 'ESCRITURADA',
    COMPLETA = 'COMPLETED',
}
