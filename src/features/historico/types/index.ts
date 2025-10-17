'use client'

export enum HistoricoStatusEnum {
    COMPLETED = 'COMPLETED',
    ESCRITURADA = 'ESCRITURADA',
    PENDENTE = 'PENDENTE',
    ERROR = 'ERROR'
}

/**
 * Interface para uma nota fiscal no histórico
 * Baseada na resposta da API https://superia-trading.app.n8n.cloud/webhook/nfs-pendentes
 */
export interface HistoricoNota {
    numero: number;
    created_at: string;
    status: HistoricoStatusEnum | string;
    updated_qive_date: string | null;
    escriturada_date: string | null;
    saved_date: string | null;
    completed_date: string | null;
    info: string;
    attempts: number;
    id_metrica: string;
    qive_id: string;
    emission_date: string;
    identified_date: string | null;
    error_date: string | null;
    processing_started_date: string | null;
    obs: string | null;
    counterparty_cnpj: string;
    filcod: number;
    filCnpj: string;
}

/**
 * Configuração de ordenação
 */
export interface SortConfig {
    field: keyof HistoricoNota | null;
    direction: 'asc' | 'desc';
}